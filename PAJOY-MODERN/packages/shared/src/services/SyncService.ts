import { SyncOperation, SyncStatus } from '@pajoy/types';
import { SYNC_CONFIG } from '@pajoy/constants';

export interface SyncProvider {
  uploadOperations(operations: SyncOperation[]): Promise<void>;
  downloadOperations(lastSyncAt?: Date): Promise<SyncOperation[]>;
  markOperationsSynced(operationIds: string[]): Promise<void>;
}

export class SyncService {
  private isOnline: boolean = false;
  private isSyncing: boolean = false;
  private pendingOperations: SyncOperation[] = [];
  private lastSyncAt: Date | null = null;
  private syncInterval: NodeJS.Timeout | null = null;
  private deviceId: string;

  constructor(
    private localProvider: SyncProvider,
    private cloudProvider: SyncProvider,
    private onSyncStatusChange?: (status: SyncStatus) => void
  ) {
    this.deviceId = this.generateDeviceId();
    this.initializeNetworkListener();
  }

  /**
   * Initialize network status listener
   */
  private initializeNetworkListener(): void {
    if (typeof window !== 'undefined' && 'navigator' in window) {
      window.addEventListener('online', () => {
        this.isOnline = true;
        console.log('🌐 Network connection restored');
        this.startSync();
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
        console.log('📵 Network connection lost');
        this.stopSync();
      });

      // Set initial online status
      this.isOnline = navigator.onLine;
    }
  }

  /**
   * Generate unique device ID
   */
  private generateDeviceId(): string {
    if (typeof window !== 'undefined' && 'localStorage' in window) {
      let deviceId = localStorage.getItem('pajoy_device_id');
      if (!deviceId) {
        deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('pajoy_device_id', deviceId);
      }
      return deviceId;
    }
    return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Add operation to sync queue
   */
  async addOperation(operation: Omit<SyncOperation, 'id' | 'timestamp' | 'deviceId' | 'synced' | 'syncAttempt'>): Promise<void> {
    const syncOperation: SyncOperation = {
      id: this.generateOperationId(),
      timestamp: new Date(),
      deviceId: this.deviceId,
      synced: false,
      syncAttempt: 0,
      ...operation,
    };

    try {
      await this.localProvider.uploadOperations([syncOperation]);
      console.log(`📝 Sync operation added: ${operation.entityType}/${operation.operation}/${operation.entityId}`);
      
      // Update pending operations count
      await this.updatePendingOperations();
      
      // Try to sync immediately if online
      if (this.isOnline && !this.isSyncing) {
        this.startSync();
      }
    } catch (error) {
      console.error('❌ Failed to add sync operation:', error);
      throw error;
    }
  }

  /**
   * Start automatic sync
   */
  startSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    if (this.isOnline && !this.isSyncing) {
      console.log('🔄 Starting automatic sync...');
      this.syncInterval = setInterval(() => {
        this.performSync();
      }, SYNC_CONFIG.SYNC_INTERVAL);
      
      // Perform initial sync
      this.performSync();
    }
  }

  /**
   * Stop automatic sync
   */
  stopSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('⏹️ Automatic sync stopped');
    }
  }

  /**
   * Perform manual sync
   */
  async performSync(): Promise<void> {
    if (this.isSyncing || !this.isOnline) {
      return;
    }

    this.isSyncing = true;
    this.updateSyncStatus();

    try {
      console.log('🔄 Performing sync...');
      
      // Upload pending operations
      await this.uploadPendingOperations();
      
      // Download remote operations
      await this.downloadRemoteOperations();
      
      this.lastSyncAt = new Date();
      console.log('✅ Sync completed successfully');
      
    } catch (error) {
      console.error('❌ Sync failed:', error);
    } finally {
      this.isSyncing = false;
      this.updateSyncStatus();
    }
  }

  /**
   * Upload pending operations to cloud
   */
  private async uploadPendingOperations(): Promise<void> {
    try {
      const operations = await this.localProvider.uploadOperations([]);
      const pendingOps = operations.filter(op => !op.synced && op.deviceId === this.deviceId);
      
      if (pendingOps.length === 0) {
        return;
      }

      console.log(`📤 Uploading ${pendingOps.length} pending operations...`);
      
      // Process in batches
      for (let i = 0; i < pendingOps.length; i += SYNC_CONFIG.BATCH_SIZE) {
        const batch = pendingOps.slice(i, i + SYNC_CONFIG.BATCH_SIZE);
        
        try {
          await this.cloudProvider.uploadOperations(batch);
          
          // Mark operations as synced
          const operationIds = batch.map(op => op.id);
          await this.localProvider.markOperationsSynced(operationIds);
          await this.cloudProvider.markOperationsSynced(operationIds);
          
          console.log(`✅ Uploaded batch ${Math.floor(i / SYNC_CONFIG.BATCH_SIZE) + 1}`);
        } catch (error) {
          console.error(`❌ Failed to upload batch ${Math.floor(i / SYNC_CONFIG.BATCH_SIZE) + 1}:`, error);
          
          // Update sync attempt count
          for (const operation of batch) {
            operation.syncAttempt = (operation.syncAttempt || 0) + 1;
          }
          
          // Update operations with retry info
          await this.localProvider.uploadOperations(batch);
        }
      }
      
    } catch (error) {
      console.error('❌ Failed to upload pending operations:', error);
      throw error;
    }
  }

  /**
   * Download remote operations from cloud
   */
  private async downloadRemoteOperations(): Promise<void> {
    try {
      console.log('📥 Downloading remote operations...');
      
      const remoteOperations = await this.cloudProvider.downloadOperations(this.lastSyncAt || undefined);
      
      if (remoteOperations.length === 0) {
        console.log('📥 No remote operations to download');
        return;
      }

      console.log(`📥 Downloaded ${remoteOperations.length} remote operations`);
      
      // Filter out operations from this device to avoid conflicts
      const externalOperations = remoteOperations.filter(op => op.deviceId !== this.deviceId);
      
      if (externalOperations.length === 0) {
        return;
      }

      console.log(`📥 Processing ${externalOperations.length} external operations`);
      
      // Apply operations in chronological order
      const sortedOperations = externalOperations.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      for (const operation of sortedOperations) {
        try {
          await this.applyOperation(operation);
          await this.localProvider.uploadOperations([operation]);
          console.log(`✅ Applied operation: ${operation.entityType}/${operation.operation}/${operation.entityId}`);
        } catch (error) {
          console.error(`❌ Failed to apply operation: ${operation.entityType}/${operation.operation}/${operation.entityId}`, error);
        }
      }
      
    } catch (error) {
      console.error('❌ Failed to download remote operations:', error);
      throw error;
    }
  }

  /**
   * Apply sync operation to local data
   */
  private async applyOperation(operation: SyncOperation): Promise<void> {
    // This would be implemented by the consuming application
    // to handle the actual data synchronization
    console.log(`🔄 Applying operation: ${operation.entityType}/${operation.operation}/${operation.entityId}`);
    
    // The implementation would depend on the specific entity type
    switch (operation.entityType) {
      case 'product':
        await this.applyProductOperation(operation);
        break;
      case 'customer':
        await this.applyCustomerOperation(operation);
        break;
      case 'sale':
        await this.applySaleOperation(operation);
        break;
      // Add more entity types as needed
      default:
        console.warn(`Unknown entity type: ${operation.entityType}`);
    }
  }

  /**
   * Apply product operation
   */
  private async applyProductOperation(operation: SyncOperation): Promise<void> {
    // Implementation would depend on the local data store
    console.log(`🔄 Applying product operation: ${operation.operation}`);
    // This would integrate with the local database/data store
  }

  /**
   * Apply customer operation
   */
  private async applyCustomerOperation(operation: SyncOperation): Promise<void> {
    // Implementation would depend on the local data store
    console.log(`🔄 Applying customer operation: ${operation.operation}`);
    // This would integrate with the local database/data store
  }

  /**
   * Apply sale operation
   */
  private async applySaleOperation(operation: SyncOperation): Promise<void> {
    // Implementation would depend on the local data store
    console.log(`🔄 Applying sale operation: ${operation.operation}`);
    // This would integrate with the local database/data store
  }

  /**
   * Update pending operations count
   */
  private async updatePendingOperations(): Promise<void> {
    try {
      const operations = await this.localProvider.uploadOperations([]);
      this.pendingOperations = operations.filter(op => !op.synced && op.deviceId === this.deviceId);
      this.updateSyncStatus();
    } catch (error) {
      console.error('❌ Failed to update pending operations:', error);
    }
  }

  /**
   * Update sync status
   */
  private updateSyncStatus(): void {
    const status: SyncStatus = {
      lastSyncAt: this.lastSyncAt,
      pendingOperations: this.pendingOperations.length,
      failedOperations: this.pendingOperations.filter(op => op.syncAttempt >= SYNC_CONFIG.RETRY_ATTEMPTS).length,
      isOnline: this.isOnline,
      syncInProgress: this.isSyncing,
    };

    if (this.onSyncStatusChange) {
      this.onSyncStatusChange(status);
    }
  }

  /**
   * Get current sync status
   */
  async getSyncStatus(): Promise<SyncStatus> {
    await this.updatePendingOperations();
    
    return {
      lastSyncAt: this.lastSyncAt,
      pendingOperations: this.pendingOperations.length,
      failedOperations: this.pendingOperations.filter(op => op.syncAttempt >= SYNC_CONFIG.RETRY_ATTEMPTS).length,
      isOnline: this.isOnline,
      syncInProgress: this.isSyncing,
    };
  }

  /**
   * Generate operation ID
   */
  private generateOperationId(): string {
    return `${this.deviceId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Force full sync
   */
  async forceFullSync(): Promise<void> {
    console.log('🔄 Forcing full sync...');
    this.lastSyncAt = null; // Reset last sync time to download everything
    await this.performSync();
  }

  /**
   * Clear sync data
   */
  async clearSyncData(): Promise<void> {
    console.log('🗑️ Clearing sync data...');
    this.pendingOperations = [];
    this.lastSyncAt = null;
    this.updateSyncStatus();
  }

  /**
   * Get sync statistics
   */
  async getSyncStatistics(): Promise<{
    totalOperations: number;
    syncedOperations: number;
    pendingOperations: number;
    failedOperations: number;
    lastSyncAt: Date | null;
    deviceId: string;
  }> {
    const operations = await this.localProvider.uploadOperations([]);
    
    return {
      totalOperations: operations.length,
      syncedOperations: operations.filter(op => op.synced).length,
      pendingOperations: operations.filter(op => !op.synced).length,
      failedOperations: operations.filter(op => op.syncAttempt >= SYNC_CONFIG.RETRY_ATTEMPTS).length,
      lastSyncAt: this.lastSyncAt,
      deviceId: this.deviceId,
    };
  }

  /**
   * Cleanup old sync operations
   */
  async cleanupOldOperations(daysToKeep: number = 30): Promise<void> {
    console.log(`🧹 Cleaning up operations older than ${daysToKeep} days...`);
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    try {
      const operations = await this.localProvider.uploadOperations([]);
      const oldOperations = operations.filter(op => 
        new Date(op.timestamp) < cutoffDate && op.synced
      );
      
      if (oldOperations.length > 0) {
        console.log(`🗑️ Removing ${oldOperations.length} old operations`);
        // Implementation would delete old operations from local storage
      }
    } catch (error) {
      console.error('❌ Failed to cleanup old operations:', error);
    }
  }
}

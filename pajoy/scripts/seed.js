const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { v4: uuid } = require('uuid');

// Force seed to write to project ./database/pajoy.db
delete process.env.PAJOY_DB_DIR;
const dbDir = path.join(__dirname, '..', 'database');
const dbPath = path.join(dbDir, 'pajoy.db');
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

const db = require('../backend/db');

console.log('[seed] DB at', db.dbPath);

// USERS
const users = [
  { username: 'admin',    full_name: 'PAJOY Admin',     password: 'admin123',    role: 'admin' },
  { username: 'manager',  full_name: 'Shop Manager',    password: 'manager123',  role: 'manager' },
  { username: 'cashier',  full_name: 'Front Cashier',   password: 'cashier123',  role: 'cashier' },
  { username: 'embroid',  full_name: 'Embroidery Lead', password: 'prod123',     role: 'production' },
  { username: 'store',    full_name: 'Store Keeper',    password: 'store123',    role: 'store' }
];
const insertUser = db.prepare('INSERT INTO users (id,username,full_name,password_hash,role,require_password_change) VALUES (?,?,?,?,?,?)');
const userIds = {};
for (const u of users) {
  const id = uuid();
  userIds[u.username] = id;
  insertUser.run(id, u.username, u.full_name, bcrypt.hashSync(u.password, 10), u.role, 1);
}

// CATEGORIES
const categories = ['Shirts','Blouses','Trousers','Shorts','Skirts','Dresses','Sweaters','Cardigans','Blazers',
  'Tracksuits','Socks','Ties','Belts','Caps','Bags','Badges','Name Tapes','Embroidery Services','Printing Services',
  'Sportswear','Accessories'];
const insertCat = db.prepare('INSERT INTO categories (id,name,sort_order) VALUES (?,?,?)');
const catIds = {};
categories.forEach((c, i) => { const id = uuid(); catIds[c] = id; insertCat.run(id, c, i); });

// SIZES
const sizes = [
  ['4Y','kids',1],['6Y','kids',2],['8Y','kids',3],['10Y','kids',4],['12Y','kids',5],['14Y','kids',6],
  ['XS','teens',7],['S','teens',8],['M','teens',9],['L','teens',10],['XL','teens',11],
  ['22','adults',12],['24','adults',13],['26','adults',14],['28','adults',15],['30','adults',16],['32','adults',17],['34','adults',18],['36','adults',19],['38','adults',20],['40','adults',21],
  ['XXL','extras',22],['XXXL','extras',23]
];
const insertSize = db.prepare('INSERT INTO sizes (id,label,group_name,sort_order) VALUES (?,?,?,?)');
const sizeIds = {};
sizes.forEach(([label,g,o]) => { const id = uuid(); sizeIds[label] = id; insertSize.run(id, label, g, o); });

// COLOURS
const colours = [
  ['White','#ffffff'],['Navy Blue','#1e2a5e'],['Sky Blue','#87ceeb'],['Royal Blue','#1c4dd1'],
  ['Bottle Green','#0c4a3a'],['Forest Green','#1f4d2b'],['Maroon','#5c0a1a'],['Burgundy','#80273f'],
  ['Black','#0a0a0a'],['Grey','#7a7a7a'],['Khaki','#b8a063'],['Brown','#5a3a22'],
  ['Red','#c0252b'],['Gold','#d4a517'],['Yellow','#f6c700'],['Cream','#f5ecd9'],
  ['Purple','#5b2a86'],['Orange','#e67318']
];
const insertColour = db.prepare('INSERT INTO colours (id,name,hex) VALUES (?,?,?)');
const colourIds = {};
colours.forEach(([n,h]) => { const id = uuid(); colourIds[n] = id; insertColour.run(id, n, h); });

// SCHOOLS (Kenyan samples)
const schools = [
  ['Alliance High School','Kiambu','secondary','boys','navy', 'Navy Blue','White'],
  ['Alliance Girls High School','Kiambu','secondary','girls','green','Bottle Green','White'],
  ['Starehe Boys Centre','Nairobi','secondary','boys','grey','Grey','Maroon'],
  ['Kenya High School','Nairobi','secondary','girls','green','Bottle Green','White'],
  ['Mangu High School','Kiambu','secondary','boys','blue','Royal Blue','Grey'],
  ['Loreto Convent Msongari','Nairobi','secondary','girls','blue','Navy Blue','Sky Blue'],
  ['Maseno School','Kisumu','secondary','boys','blue','Royal Blue','White'],
  ['Pangani Girls','Nairobi','secondary','girls','green','Forest Green','White'],
  ['Lenana School','Nairobi','secondary','boys','grey','Grey','Maroon'],
  ['Nairobi School','Nairobi','secondary','boys','navy','Navy Blue','White'],
  ['Moi Girls Eldoret','Uasin Gishu','secondary','girls','blue','Sky Blue','Navy Blue'],
  ['St. Mary\'s School Nairobi','Nairobi','primary','mixed','blue','Royal Blue','White'],
  ['Brookhouse School','Nairobi','primary','mixed','green','Bottle Green','Gold'],
  ['Hillcrest International','Nairobi','primary','mixed','navy','Navy Blue','Yellow'],
  ['Riara Springs Academy','Nairobi','primary','mixed','red','Red','White'],
  ['Aga Khan Academy','Mombasa','secondary','mixed','grey','Grey','Maroon'],
  ['Precious Blood Riruta','Nairobi','secondary','girls','blue','Sky Blue','Navy Blue'],
  ['Strathmore School','Nairobi','secondary','boys','blue','Navy Blue','White'],
  ['St. George\'s Girls','Nairobi','secondary','girls','green','Bottle Green','White'],
  ['Limuru Girls School','Kiambu','secondary','girls','navy','Navy Blue','Sky Blue'],
  ['Nakuru Boys High','Nakuru','secondary','boys','blue','Royal Blue','White'],
  ['Friends School Kamusinga','Bungoma','secondary','boys','grey','Grey','Maroon'],
  ['Cardinal Otunga High','Kisii','secondary','boys','navy','Navy Blue','Yellow'],
  ['Bishop Gatimu Ngandu Girls','Nyeri','secondary','girls','green','Bottle Green','White'],
  ['Sunshine Secondary','Nairobi','secondary','mixed','blue','Royal Blue','White']
];
const insertSchool = db.prepare(`INSERT INTO schools (id,name,county,level,gender,code,primary_color,secondary_color)
                                 VALUES (?,?,?,?,?,?,?,?)`);
const schoolIds = {};
schools.forEach(s => {
  const id = uuid();
  schoolIds[s[0]] = id;
  insertSchool.run(id, s[0], s[1], s[2], s[3], s[4], s[5], s[6]);
});

// CUSTOMERS
const customers = [
  ['Jane Wanjiru','0712 345 678','jane@example.com'],
  ['Peter Otieno','0723 111 222', null],
  ['Mary Achieng','0701 555 444', 'mary@example.com'],
  ['David Kamau','0733 888 999', null],
  ['Faith Mwende','0790 123 456', null],
  ['Walk-in Customer','-', null]
];
const insertCust = db.prepare('INSERT INTO customers (id,name,phone,email) VALUES (?,?,?,?)');
const custIds = [];
customers.forEach(c => { const id = uuid(); custIds.push(id); insertCust.run(id, c[0], c[1], c[2]); });

// SUPPLIERS
const suppliers = [
  ['Rivatex East Africa','Sales Desk','0202 200 100','sales@rivatex.co.ke','Fabric'],
  ['Spinners & Spinners','Order Desk','0203 511 200','orders@spinners.co.ke','Fabric'],
  ['Madhupaper Kenya','Customer Care','0204 700 200','info@madhupaper.co.ke','Packaging'],
  ['Thread House Ltd','James','0712 999 100','threads@example.co.ke','Embroidery thread'],
  ['Inkmart Supplies','Mercy','0722 333 444','sales@inkmart.co.ke','Printing inks']
];
const insertSup = db.prepare('INSERT INTO suppliers (id,name,contact,phone,email,category) VALUES (?,?,?,?,?,?)');
suppliers.forEach(s => insertSup.run(uuid(), ...s));

// PRODUCTS + VARIANTS
const insertProduct = db.prepare(`INSERT INTO products (id,sku,name,description,category_id,school_id,base_price,cost_price,reorder_level)
                                  VALUES (?,?,?,?,?,?,?,?,?)`);
const insertVariant = db.prepare(`INSERT INTO variants (id,product_id,size_id,colour_id,gender,barcode,price,cost_price,stock_qty,reorder_level)
                                  VALUES (?,?,?,?,?,?,?,?,?,?)`);
const insertInvLog = db.prepare('INSERT INTO inventory_logs (id,variant_id,change_qty,reason,user_id) VALUES (?,?,?,?,?)');

let skuN = 1000;
function makeSku() { skuN++; return 'PJY-' + skuN; }

function makeProduct({ name, category, school, colour, gender, sizesArr, price, cost, reorder = 5 }) {
  const pid = uuid();
  insertProduct.run(pid, makeSku(), name, name + ' for ' + school,
    catIds[category], schoolIds[school], price, cost, reorder);
  for (const sz of sizesArr) {
    const vid = uuid();
    const stock = 10 + Math.floor(Math.random() * 25);
    insertVariant.run(vid, pid, sizeIds[sz], colourIds[colour], gender, null, price, cost, stock, reorder);
    insertInvLog.run(uuid(), vid, stock, 'restock', userIds.store);
  }
  return pid;
}

const kidsSizes  = ['6Y','8Y','10Y','12Y','14Y'];
const teenSizes  = ['S','M','L','XL'];
const trousSizes = ['28','30','32','34','36'];

// Build products per school (sample subset)
const productPlan = [
  { name: 'White Shirt Short Sleeve', category: 'Shirts',    colour: 'White',        gender: 'unisex', sizesArr: kidsSizes,  price: 650,  cost: 420 },
  { name: 'White Shirt Long Sleeve',  category: 'Shirts',    colour: 'White',        gender: 'unisex', sizesArr: teenSizes,  price: 850,  cost: 540 },
  { name: 'Sky Blue Shirt',           category: 'Shirts',    colour: 'Sky Blue',     gender: 'unisex', sizesArr: kidsSizes,  price: 700,  cost: 460 },
  { name: 'Grey Trouser',             category: 'Trousers',  colour: 'Grey',         gender: 'boys',   sizesArr: trousSizes, price: 1200, cost: 780 },
  { name: 'Khaki Trouser',            category: 'Trousers',  colour: 'Khaki',        gender: 'boys',   sizesArr: trousSizes, price: 1150, cost: 750 },
  { name: 'Bottle Green Skirt',       category: 'Skirts',    colour: 'Bottle Green', gender: 'girls',  sizesArr: teenSizes,  price: 1100, cost: 700 },
  { name: 'Navy Pinafore',            category: 'Dresses',   colour: 'Navy Blue',    gender: 'girls',  sizesArr: kidsSizes,  price: 1400, cost: 900 },
  { name: 'Navy Sweater',             category: 'Sweaters',  colour: 'Navy Blue',    gender: 'unisex', sizesArr: teenSizes,  price: 1600, cost: 1050 },
  { name: 'Maroon Sweater',           category: 'Sweaters',  colour: 'Maroon',       gender: 'unisex', sizesArr: teenSizes,  price: 1650, cost: 1080 },
  { name: 'School Tie',               category: 'Ties',      colour: 'Navy Blue',    gender: 'unisex', sizesArr: ['M'],      price: 350,  cost: 180 },
  { name: 'School Socks (pair)',      category: 'Socks',     colour: 'Grey',         gender: 'unisex', sizesArr: ['S','M','L'], price: 220, cost: 110 },
  { name: 'PE Tracksuit',             category: 'Tracksuits',colour: 'Navy Blue',    gender: 'unisex', sizesArr: teenSizes,  price: 2400, cost: 1550 },
  { name: 'Sports T-Shirt',           category: 'Sportswear',colour: 'White',        gender: 'unisex', sizesArr: teenSizes,  price: 600,  cost: 340 },
  { name: 'School Bag',               category: 'Bags',      colour: 'Black',        gender: 'unisex', sizesArr: ['M'],      price: 1800, cost: 1100 },
  { name: 'School Cap',               category: 'Caps',      colour: 'Navy Blue',    gender: 'unisex', sizesArr: ['M'],      price: 450,  cost: 230 }
];
const targetSchools = ['Alliance High School','Kenya High School','Brookhouse School','Hillcrest International',
                       'Strathmore School','Maseno School','Sunshine Secondary','Loreto Convent Msongari'];
const productIds = [];
for (const sch of targetSchools) {
  for (const p of productPlan) {
    productIds.push(makeProduct({ ...p, school: sch }));
  }
}

// Embroidery service (shared)
makeProduct({ name: 'School Logo Embroidery', category: 'Embroidery Services', school: 'Alliance High School',
              colour: 'Gold', gender: 'unisex', sizesArr: ['M'], price: 250, cost: 80, reorder: 0 });
makeProduct({ name: 'Name Tape Embroidery',   category: 'Name Tapes', school: 'Alliance High School',
              colour: 'White', gender: 'unisex', sizesArr: ['M'], price: 100, cost: 30, reorder: 0 });
makeProduct({ name: 'Heat Press Print',       category: 'Printing Services', school: 'Strathmore School',
              colour: 'Black', gender: 'unisex', sizesArr: ['M'], price: 300, cost: 120, reorder: 0 });

// EMBROIDERY JOBS
const insertEmb = db.prepare(`INSERT INTO embroidery_jobs (id,job_no,customer_id,school_id,garment,design_notes,thread_colours,placement,qty,unit_cost,total_cost,due_date,assigned_to,status)
                              VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
const embStatuses = ['pending','digitizing','production','qa','for_collection','completed'];
for (let i = 0; i < 12; i++) {
  const qty = 5 + Math.floor(Math.random() * 30);
  const cost = 200 + Math.floor(Math.random() * 200);
  insertEmb.run(uuid(), 'EMB-S' + (1000 + i),
    custIds[i % custIds.length],
    schoolIds[targetSchools[i % targetSchools.length]],
    'Sweater', 'School crest on left chest', 'Gold, Navy', 'Left chest',
    qty, cost, qty * cost,
    Date.now() + (i + 1) * 86400000, userIds.embroid,
    embStatuses[i % embStatuses.length]);
}

// PRINT JOBS
const insertPrt = db.prepare(`INSERT INTO print_jobs (id,job_no,customer_id,print_type,garment,design_notes,qty,unit_cost,total_cost,due_date,assigned_to,status)
                              VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
const prtTypes = ['screen','heat_press','vinyl','sublimation','text'];
const prtStatuses = ['pending','design_pending','production','qa','completed'];
for (let i = 0; i < 10; i++) {
  const qty = 10 + Math.floor(Math.random() * 50);
  const cost = 150 + Math.floor(Math.random() * 250);
  insertPrt.run(uuid(), 'PRT-S' + (1000 + i),
    custIds[i % custIds.length],
    prtTypes[i % prtTypes.length], 'T-Shirt', 'Front + back print',
    qty, cost, qty * cost, Date.now() + (i + 1) * 86400000, userIds.embroid,
    prtStatuses[i % prtStatuses.length]);
}

// EXPENSES
const insertExp = db.prepare('INSERT INTO expenses (id,category,amount,description,date,user_id) VALUES (?,?,?,?,?,?)');
const expCats = ['rent','salaries','transport','electricity','water','supplies','thread','printing materials','maintenance','other'];
for (let i = 0; i < 20; i++) {
  insertExp.run(uuid(), expCats[i % expCats.length], 500 + Math.floor(Math.random() * 8000),
    'Routine ' + expCats[i % expCats.length],
    Date.now() - i * 86400000, userIds.manager);
}

// Sample sales (last 14 days, random)
const allVariants = db.prepare('SELECT v.id AS variant_id, v.product_id, v.price, p.name FROM variants v JOIN products p ON p.id=v.product_id WHERE v.stock_qty > 0').all();
const insertSale = db.prepare(`INSERT INTO sales (id,receipt_no,customer_id,cashier_id,subtotal,discount,tax,total,payment_method,cash_amount,mpesa_amount)
                               VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
const insertSI = db.prepare(`INSERT INTO sale_items (id,sale_id,variant_id,product_id,name_snapshot,qty,unit_price,line_total) VALUES (?,?,?,?,?,?,?,?)`);
const decStock = db.prepare('UPDATE variants SET stock_qty=stock_qty-? WHERE id=?');
let receiptN = 1;
for (let d = 0; d < 14; d++) {
  const txCount = 2 + Math.floor(Math.random() * 5);
  for (let i = 0; i < txCount; i++) {
    const items = [];
    const itemCount = 1 + Math.floor(Math.random() * 3);
    for (let k = 0; k < itemCount; k++) {
      const v = allVariants[Math.floor(Math.random() * allVariants.length)];
      const qty = 1 + Math.floor(Math.random() * 3);
      items.push({ ...v, qty });
    }
    const subtotal = items.reduce((s, it) => s + it.qty * it.price, 0);
    const total = subtotal;
    const sid = uuid();
    const ts = Date.now() - d * 86400000 - Math.floor(Math.random() * 8 * 3600000);
    const isMpesa = Math.random() > 0.5;
    db.prepare(`INSERT INTO sales (id,receipt_no,customer_id,cashier_id,subtotal,discount,tax,total,payment_method,cash_amount,mpesa_amount,created_at,last_modified)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(sid, 'PJY-S' + String(receiptN++).padStart(5,'0'),
           custIds[Math.floor(Math.random() * custIds.length)], userIds.cashier,
           subtotal, 0, 0, total,
           isMpesa ? 'mpesa' : 'cash',
           isMpesa ? 0 : total, isMpesa ? total : 0,
           ts, ts);
    for (const it of items) {
      insertSI.run(uuid(), sid, it.variant_id, it.product_id, it.name, it.qty, it.price, it.qty * it.price);
      decStock.run(it.qty, it.variant_id);
    }
  }
}

// SETTINGS
const setSetting = db.prepare('INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value');
setSetting.run('shop_name', 'PAJOY SYSTEM');
setSetting.run('shop_address', 'Nairobi, Kenya');
setSetting.run('shop_phone', '+254 700 000 000');
setSetting.run('currency', 'KES');
setSetting.run('tax_rate', '0');

console.log('[seed] DONE — users, schools, products, variants, sales, jobs, expenses seeded.');
console.log('[seed] Login as admin / admin123');

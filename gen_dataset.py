import csv, random
random.seed(42)
catalog = {
 "Electronics": (["Volta","Pixelon","Nexa","Orbitek","Lumio"], ["Wireless Earbuds","Bluetooth Speaker","Smartwatch","Power Bank","USB-C Hub","Webcam","Mechanical Keyboard","Gaming Mouse","Monitor Stand","Action Camera"], (15, 600)),
 "Home & Kitchen": (["Hearthly","Cookwell","Aroma","Brewmate","Nestor"], ["Air Fryer","Stand Mixer","Electric Kettle","Knife Set","Cast Iron Skillet","Coffee Grinder","Rice Cooker","Blender","Toaster Oven","Storage Jars"], (10, 350)),
 "Clothing": (["Threadline","Norwood","Stride","Oakridge","Linen & Co"], ["Cotton T-Shirt","Denim Jacket","Running Shorts","Wool Sweater","Hoodie","Chino Pants","Rain Jacket","Casual Shirt","Thermal Socks","Baseball Cap"], (8, 180)),
 "Sports & Outdoors": (["Summit","Trailhead","Kinetic","Ridgeback","Paddle"], ["Yoga Mat","Hiking Backpack","Camping Tent","Water Bottle","Resistance Bands","Trekking Poles","Sleeping Bag","Dumbbell Set","Jump Rope","Cycling Helmet"], (9, 400)),
 "Books & Stationery": (["Inkwell","Paperleaf","Quillby","Foliant","Marginalia"], ["Hardcover Notebook","Fountain Pen","Desk Planner","Sketchbook","Sticky Note Set","Gel Pen Pack","Bookmark Set","Pencil Case","Whiteboard","Highlighter Set"], (2, 60)),
 "Beauty & Care": (["Dewdrop","Calmora","Veliora","Purely","Sundial"], ["Face Serum","Moisturizer","Sunscreen SPF 50","Shampoo","Lip Balm","Hair Dryer","Body Lotion","Electric Toothbrush","Beard Trimmer","Face Mask Pack"], (4, 120)),
 "Toys & Games": (["Playnest","Bricko","Giggle","Mindmaze","Tinkerly"], ["Building Blocks","Board Game","Puzzle 1000pc","Remote Control Car","Plush Bear","Art Kit","Card Game","Science Kit","Wooden Train","Chess Set"], (5, 150)),
 "Office": (["Deskly","Ergon","Tidy","Workwell","Paperline"], ["Office Chair","Standing Desk","Desk Lamp","Monitor Arm","Filing Cabinet","Laptop Sleeve","Cable Organizer","Footrest","Label Maker","Shredder"], (12, 700)),
}
adj = ["Classic","Pro","Mini","Ultra","Eco","Compact","Premium","Essential","Smart","Lite","Max","Everyday"]
feat = ["Built to last","Lightweight and portable","Easy to clean","Great everyday value","Designed for comfort","Energy efficient","Ships in recyclable packaging","Backed by a one year warranty","Popular gift choice","Works right out of the box"]
rows=[]
for i in range(1000):
    cat = random.choice(list(catalog))
    brands, nouns, (lo,hi) = catalog[cat]
    brand, noun = random.choice(brands), random.choice(nouns)
    name = f"{random.choice(adj)} {noun} {random.randint(100,999)}"
    price = round(random.uniform(lo,hi),2)
    stock = random.choice([0,0,random.randint(1,40),random.randint(10,300),random.randint(100,500)])
    desc = f"{noun} by {brand}. {random.choice(feat)}."
    rows.append([name,cat.replace(",",""),brand,f"{price:.2f}",stock,desc])
for r in rows:
    assert not any("," in str(c) for c in r), r
with open("backend/src/main/resources/products.csv","w",newline="") as f:
    w=csv.writer(f,lineterminator="\n"); w.writerow(["name","category","brand","price","stock","description"]); w.writerows(rows)
print(len(rows))

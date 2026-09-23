/**
 * MediCare Medical Store Management System
 * Master Application Controller & Unified API Client
 *
 * Provides live connection to PHP backend (XAMPP/WAMP) with automatic fallback
 * to in-browser relational storage engine so the system functions seamlessly
 * both in local XAMPP and in cloud preview environments.
 */

// =========================================================================
// INITIAL DEMO DATABASE SEED (Mirrors database/medicare_management.sql)
// =========================================================================
const INITIAL_DEMO_DATA = {
  categories: [
    { id: 1, category_name: 'Pain Relief', description: 'Over-the-counter analgesic balms, sprays, and anti-inflammatory ointments', status: 'active', product_count: 5 },
    { id: 2, category_name: 'Vitamins & Supplements', description: 'Daily nutritional multivitamins, calcium tablets, and herbal immunity boosters', status: 'active', product_count: 5 },
    { id: 3, category_name: 'First Aid', description: 'Sterile wound dressings, medical tape, antiseptic liquids, and emergency burn care', status: 'active', product_count: 5 },
    { id: 4, category_name: 'Health Devices', description: 'Diagnostic instruments including digital blood pressure monitors, pulse oximeters, and clinical thermometers', status: 'active', product_count: 5 },
    { id: 5, category_name: 'Personal Care', description: 'Medicated skin lotions, antibacterial sanitizers, oral hygiene rinses, and sun protection', status: 'active', product_count: 4 },
    { id: 6, category_name: 'Baby Care', description: 'Pediatric gentle wipes, soothing diaper rash creams, baby gripe water, and hypoallergenic powders', status: 'active', product_count: 4 },
    { id: 7, category_name: 'Elder Care', description: 'Adult incontinence briefs, joint support heat belts, mobility grips, and anti-slip walking aids', status: 'active', product_count: 4 }
  ],
  suppliers: [
    { id: 1, supplier_name: 'Rajesh Mehta', company_name: 'Apex Healthcare Distributors', email: 'orders@apexhealth.com', phone: '+91 98201 44521', gst_number: '27AAACA9921D1ZK', address: 'Plot 42, Andheri Pharma Zone, Mumbai, MH', status: 'active', product_count: 4 },
    { id: 2, supplier_name: 'Anita Deshmukh', company_name: 'Beacon Medical Supplies Ltd', email: 'sales@beaconmed.in', phone: '+91 98402 33190', gst_number: '33AABCB1293P1ZM', address: '88 Anna Salai Industrial Estate, Chennai, TN', status: 'active', product_count: 4 },
    { id: 3, supplier_name: 'Vikram Sharma', company_name: 'CureWell Diagnostics Hub', email: 'supply@curewelldiag.com', phone: '+91 98110 55412', gst_number: '07AACCC4421M1ZN', address: 'B-14 Okhla Industrial Phase II, New Delhi, DL', status: 'active', product_count: 2 },
    { id: 4, supplier_name: 'Siddharth Rao', company_name: 'Delta Pharma Logistics', email: 'contact@deltapharma.org', phone: '+91 97401 22845', gst_number: '29AACCD8812K1ZO', address: '7th Cross Peenya Industrial Area, Bengaluru, KA', status: 'active', product_count: 3 },
    { id: 5, supplier_name: 'Pooja Kulkarni', company_name: 'EverGreen Herbal & Wellness', email: 'wholesale@evergreenherb.in', phone: '+91 98901 77234', gst_number: '27AACCE3391J1ZP', address: 'Shivaji Nagar Midc Road, Pune, MH', status: 'active', product_count: 3 },
    { id: 6, supplier_name: 'Manish Verma', company_name: 'Firstline Surgical Corp', email: 'orders@firstlinesurg.com', phone: '+91 94150 66890', gst_number: '09AACCF5519L1ZQ', address: 'Industrial Area Sector 5, Lucknow, UP', status: 'active', product_count: 3 },
    { id: 7, supplier_name: 'Sunil Patel', company_name: 'Global MedTech Instruments', email: 'info@globalmedtech.co', phone: '+91 98250 88129', gst_number: '24AACCG7741F1ZR', address: 'GIDC Electronics Zone, Gandhinagar, GJ', status: 'active', product_count: 3 },
    { id: 8, supplier_name: 'Kavita Menon', company_name: 'Horizon Pediatric & Baby Care', email: 'sales@horizonbaby.in', phone: '+91 94470 11923', gst_number: '32AACCH9982Q1ZS', address: 'Kaloor Health Hub, Kochi, KL', status: 'active', product_count: 4 },
    { id: 9, supplier_name: 'Deepak Banerjee', company_name: 'Imperial ElderCare Products', email: 'supply@imperialelder.com', phone: '+91 98300 44781', gst_number: '19AACCI6610H1ZT', address: 'Sector V Salt Lake, Kolkata, WB', status: 'active', product_count: 4 },
    { id: 10, supplier_name: 'Neha Chopra', company_name: 'Zenith Sanitisers & Hygiene', email: 'dispatch@zenithhygiene.com', phone: '+91 98720 99312', gst_number: '03AACCJ2291E1ZU', address: 'Phase 8 Industrial Focal Point, Mohali, PB', status: 'active', product_count: 2 }
  ],
  products: [
    { id: 1, product_code: 'MED-PR-001', product_name: 'Diclofenac Fast Relief Gel 30g', category_id: 1, category_name: 'Pain Relief', supplier_id: 1, company_name: 'Apex Healthcare Distributors', brand: 'VoltaGel', batch_number: 'BCH-2025-01', manufacturing_date: '2025-01-10', expiry_date: '2027-01-10', purchase_price: 65.00, selling_price: 95.00, stock_quantity: 52, reorder_level: 15, unit: 'Tube', rack_number: 'Rack A-1', description: 'Topical analgesic soothing gel for backache, joint stiffness, and muscular sprains.', status: 'active' },
    { id: 2, product_code: 'MED-PR-002', product_name: 'Ibuprofen & Paracetamol Pain Balm 20g', category_id: 1, category_name: 'Pain Relief', supplier_id: 1, company_name: 'Apex Healthcare Distributors', brand: 'TigerCare', batch_number: 'BCH-2024-11', manufacturing_date: '2024-11-01', expiry_date: '2026-11-01', purchase_price: 42.00, selling_price: 68.00, stock_quantity: 38, reorder_level: 12, unit: 'Jar', rack_number: 'Rack A-1', description: 'Herbal infused fast-acting balm for tension headaches and neck discomfort.', status: 'active' },
    { id: 3, product_code: 'MED-PR-003', product_name: 'Menthol Cooling Pain Spray 55g', category_id: 1, category_name: 'Pain Relief', supplier_id: 2, company_name: 'Beacon Medical Supplies Ltd', brand: 'ReliefSprint', batch_number: 'BCH-2025-03', manufacturing_date: '2025-03-05', expiry_date: '2027-03-05', purchase_price: 120.00, selling_price: 165.00, stock_quantity: 6, reorder_level: 15, unit: 'Aerosol Can', rack_number: 'Rack A-2', description: 'Targeted cold therapy micro-spray for acute sports injuries and ligament strain.', status: 'active' },
    { id: 4, product_code: 'MED-PR-004', product_name: 'Capsaicin Deep Heat Patch (Pack of 5)', category_id: 1, category_name: 'Pain Relief', supplier_id: 2, company_name: 'Beacon Medical Supplies Ltd', brand: 'ThermaRelief', batch_number: 'BCH-2023-08', manufacturing_date: '2023-08-15', expiry_date: '2025-08-15', purchase_price: 140.00, selling_price: 199.00, stock_quantity: 8, reorder_level: 10, unit: 'Box (5 Patches)', rack_number: 'Rack A-2', description: 'Long-lasting self-adhesive continuous warmth patch for chronic lower back tension.', status: 'active' },
    { id: 5, product_code: 'MED-PR-005', product_name: 'Ayurvedic Herbal Joint Massage Oil 100ml', category_id: 1, category_name: 'Pain Relief', supplier_id: 5, company_name: 'EverGreen Herbal & Wellness', brand: 'VedaComfort', batch_number: 'BCH-2024-06', manufacturing_date: '2024-06-20', expiry_date: '2026-06-20', purchase_price: 110.00, selling_price: 175.00, stock_quantity: 0, reorder_level: 10, unit: 'Bottle', rack_number: 'Rack A-3', description: 'Traditional formulation enriched with wintergreen oil, eucalyptus, and camphor.', status: 'active' },
    { id: 6, product_code: 'MED-VS-001', product_name: 'Daily Multivitamin & Minerals (60 Tabs)', category_id: 2, category_name: 'Vitamins & Supplements', supplier_id: 4, company_name: 'Delta Pharma Logistics', brand: 'NutriDaily', batch_number: 'BCH-2025-02', manufacturing_date: '2025-02-14', expiry_date: '2027-02-14', purchase_price: 210.00, selling_price: 320.00, stock_quantity: 64, reorder_level: 20, unit: 'Bottle (60 Tablets)', rack_number: 'Rack B-1', description: 'Comprehensive micronutrient supplement with Vitamin C, D3, Zinc, and Selenium.', status: 'active' },
    { id: 7, product_code: 'MED-VS-002', product_name: 'Calcium Citrate + Vitamin D3 (30 Tabs)', category_id: 2, category_name: 'Vitamins & Supplements', supplier_id: 4, company_name: 'Delta Pharma Logistics', brand: 'CalciStrong', batch_number: 'BCH-2025-01', manufacturing_date: '2025-01-20', expiry_date: '2026-10-15', purchase_price: 135.00, selling_price: 210.00, stock_quantity: 14, reorder_level: 15, unit: 'Strip', rack_number: 'Rack B-1', description: 'Bio-absorbable calcium citrate malate formula supporting bone mineral density.', status: 'active' },
    { id: 8, product_code: 'MED-VS-003', product_name: 'Omega-3 Deep Sea Fish Oil 1000mg (60 Softgels)', category_id: 2, category_name: 'Vitamins & Supplements', supplier_id: 4, company_name: 'Delta Pharma Logistics', brand: 'OceanPure', batch_number: 'BCH-2025-04', manufacturing_date: '2025-04-01', expiry_date: '2027-04-01', purchase_price: 380.00, selling_price: 549.00, stock_quantity: 25, reorder_level: 10, unit: 'Bottle', rack_number: 'Rack B-2', description: 'Molecularly distilled EPA & DHA essential fatty acids.', status: 'active' },
    { id: 9, product_code: 'MED-VS-004', product_name: 'Effervescent Vitamin C 1000mg + Zinc (20 Fizz Tabs)', category_id: 2, category_name: 'Vitamins & Supplements', supplier_id: 5, company_name: 'EverGreen Herbal & Wellness', brand: 'ImmunoBoost', batch_number: 'BCH-2024-12', manufacturing_date: '2024-12-10', expiry_date: '2026-12-10', purchase_price: 180.00, selling_price: 260.00, stock_quantity: 4, reorder_level: 15, unit: 'Tube (20 Tabs)', rack_number: 'Rack B-2', description: 'Orange-flavored effervescent immune defense beverage tablets.', status: 'active' },
    { id: 10, product_code: 'MED-VS-005', product_name: 'Plant-Based Iron & Folic Acid Complex (30 Caps)', category_id: 2, category_name: 'Vitamins & Supplements', supplier_id: 5, company_name: 'EverGreen Herbal & Wellness', brand: 'FloraHeme', batch_number: 'BCH-2023-09', manufacturing_date: '2023-09-01', expiry_date: '2025-09-01', purchase_price: 150.00, selling_price: 230.00, stock_quantity: 0, reorder_level: 8, unit: 'Blister Pack', rack_number: 'Rack B-3', description: 'Gentle non-constipating plant-derived iron capsules.', status: 'active' },
    { id: 11, product_code: 'MED-FA-001', product_name: 'Sterile Adhesive Waterproof Bandages (Pack of 50)', category_id: 3, category_name: 'First Aid', supplier_id: 6, company_name: 'Firstline Surgical Corp', brand: 'FirstGuard', batch_number: 'BCH-2025-01', manufacturing_date: '2025-01-05', expiry_date: '2030-01-05', purchase_price: 55.00, selling_price: 89.00, stock_quantity: 110, reorder_level: 25, unit: 'Box (50 Strips)', rack_number: 'Rack C-1', description: 'Hypoallergenic flexible waterproof bandages with non-stick absorbent pad.', status: 'active' },
    { id: 12, product_code: 'MED-FA-002', product_name: 'Povidone Iodine Antiseptic Solution 100ml', category_id: 3, category_name: 'First Aid', supplier_id: 6, company_name: 'Firstline Surgical Corp', brand: 'MicroCure', batch_number: 'BCH-2025-02', manufacturing_date: '2025-02-18', expiry_date: '2027-02-18', purchase_price: 62.00, selling_price: 95.00, stock_quantity: 48, reorder_level: 15, unit: 'Bottle', rack_number: 'Rack C-1', description: 'Broad-spectrum antimicrobial topical germicide for minor cuts.', status: 'active' },
    { id: 13, product_code: 'MED-FA-003', product_name: 'Antiseptic Disinfectant Liquid 250ml', category_id: 3, category_name: 'First Aid', supplier_id: 10, company_name: 'Zenith Sanitisers & Hygiene', brand: 'SaniCare', batch_number: 'BCH-2024-10', manufacturing_date: '2024-10-15', expiry_date: '2026-10-15', purchase_price: 78.00, selling_price: 115.00, stock_quantity: 9, reorder_level: 20, unit: 'Bottle', rack_number: 'Rack C-2', description: 'Concentrated disinfectant liquid for first aid wound hygiene.', status: 'active' },
    { id: 14, product_code: 'MED-FA-004', product_name: 'Elastic Crepe Bandage 10cm x 4m', category_id: 3, category_name: 'First Aid', supplier_id: 6, company_name: 'Firstline Surgical Corp', brand: 'OrthoWrap', batch_number: 'BCH-2025-03', manufacturing_date: '2025-03-01', expiry_date: '2030-03-01', purchase_price: 85.00, selling_price: 135.00, stock_quantity: 32, reorder_level: 10, unit: 'Roll', rack_number: 'Rack C-2', description: 'Heavy cotton high-stretch compression bandage for joint support.', status: 'active' },
    { id: 15, product_code: 'MED-FA-005', product_name: 'Emergency Burn Relief Hydrogel 50g', category_id: 3, category_name: 'First Aid', supplier_id: 2, company_name: 'Beacon Medical Supplies Ltd', brand: 'BurnShield', batch_number: 'BCH-2024-05', manufacturing_date: '2024-05-10', expiry_date: '2026-05-10', purchase_price: 95.00, selling_price: 145.00, stock_quantity: 2, reorder_level: 10, unit: 'Tube', rack_number: 'Rack C-3', description: 'Medical-grade cooling hydrogel formula containing tea tree essence.', status: 'active' },
    { id: 16, product_code: 'MED-HD-001', product_name: 'Digital Upper Arm Blood Pressure Monitor', category_id: 4, category_name: 'Health Devices', supplier_id: 3, company_name: 'CureWell Diagnostics Hub', brand: 'OmroTech', batch_number: 'BCH-2025-01', manufacturing_date: '2025-01-01', expiry_date: '2030-01-01', purchase_price: 1150.00, selling_price: 1699.00, stock_quantity: 18, reorder_level: 5, unit: 'Device Unit', rack_number: 'Rack D-1', description: 'Fully automatic oscillometric BP measurement with irregular heartbeat detector.', status: 'active' },
    { id: 17, product_code: 'MED-HD-002', product_name: 'Fingertip LED Pulse Oximeter', category_id: 4, category_name: 'Health Devices', supplier_id: 3, company_name: 'CureWell Diagnostics Hub', brand: 'OxyCheck', batch_number: 'BCH-2025-02', manufacturing_date: '2025-02-05', expiry_date: '2030-02-05', purchase_price: 450.00, selling_price: 699.00, stock_quantity: 22, reorder_level: 8, unit: 'Device Unit', rack_number: 'Rack D-1', description: 'Non-invasive SpO2 oxygen saturation level and PR pulse rate monitor.', status: 'active' },
    { id: 18, product_code: 'MED-HD-003', product_name: 'Instant Clinical Infrared Forehead Thermometer', category_id: 4, category_name: 'Health Devices', supplier_id: 7, company_name: 'Global MedTech Instruments', brand: 'ThermoScan', batch_number: 'BCH-2025-03', manufacturing_date: '2025-03-12', expiry_date: '2030-03-12', purchase_price: 650.00, selling_price: 999.00, stock_quantity: 15, reorder_level: 6, unit: 'Device Unit', rack_number: 'Rack D-2', description: '1-second contactless high-precision body temperature scanner.', status: 'active' },
    { id: 19, product_code: 'MED-HD-004', product_name: 'Blood Glucose Monitoring Starter Kit (with 25 Strips)', category_id: 4, category_name: 'Health Devices', supplier_id: 7, company_name: 'Global MedTech Instruments', brand: 'GlucoTrue', batch_number: 'BCH-2024-11', manufacturing_date: '2024-11-20', expiry_date: '2026-11-20', purchase_price: 720.00, selling_price: 1099.00, stock_quantity: 5, reorder_level: 8, unit: 'Kit Box', rack_number: 'Rack D-2', description: 'Electrochemical biosensor glucometer kit with lancing device.', status: 'active' },
    { id: 20, product_code: 'MED-HD-005', product_name: 'Portable Ultrasonic Mesh Nebulizer', category_id: 4, category_name: 'Health Devices', supplier_id: 7, company_name: 'Global MedTech Instruments', brand: 'BreatheEasy', batch_number: 'BCH-2025-01', manufacturing_date: '2025-01-15', expiry_date: '2030-01-15', purchase_price: 920.00, selling_price: 1399.00, stock_quantity: 7, reorder_level: 5, unit: 'Unit', rack_number: 'Rack D-3', description: 'Silent handheld respiratory mist inhaler for children and adults.', status: 'active' },
    { id: 21, product_code: 'MED-PC-001', product_name: 'Broad Spectrum Sunscreen Gel SPF 50 PA++++ 50g', category_id: 5, category_name: 'Personal Care', supplier_id: 1, company_name: 'Apex Healthcare Distributors', brand: 'DermaShield', batch_number: 'BCH-2025-02', manufacturing_date: '2025-02-10', expiry_date: '2027-02-10', purchase_price: 260.00, selling_price: 399.00, stock_quantity: 35, reorder_level: 10, unit: 'Tube', rack_number: 'Rack E-1', description: 'Non-comedogenic, matte finish mineral sun protectant.', status: 'active' },
    { id: 22, product_code: 'MED-PC-002', product_name: 'Moisturizing Ceramide Barrier Lotion 200ml', category_id: 5, category_name: 'Personal Care', supplier_id: 1, company_name: 'Apex Healthcare Distributors', brand: 'HydraDerm', batch_number: 'BCH-2025-03', manufacturing_date: '2025-03-01', expiry_date: '2027-03-01', purchase_price: 290.00, selling_price: 449.00, stock_quantity: 28, reorder_level: 10, unit: 'Pump Bottle', rack_number: 'Rack E-1', description: 'Fragrance-free therapeutic moisturizer with 3 essential ceramides.', status: 'active' },
    { id: 23, product_code: 'MED-PC-003', product_name: 'Antibacterial Instant Hand Sanitizer Gel 500ml', category_id: 5, category_name: 'Personal Care', supplier_id: 10, company_name: 'Zenith Sanitisers & Hygiene', brand: 'PureGuard', batch_number: 'BCH-2024-09', manufacturing_date: '2024-09-12', expiry_date: '2026-09-12', purchase_price: 95.00, selling_price: 149.00, stock_quantity: 4, reorder_level: 15, unit: 'Pump Bottle', rack_number: 'Rack E-2', description: '75% medical isopropyl alcohol hand sanitizer with aloe vera.', status: 'active' },
    { id: 24, product_code: 'MED-PC-004', product_name: 'Chlorhexidine Antiseptic Mouthwash 200ml', category_id: 5, category_name: 'Personal Care', supplier_id: 2, company_name: 'Beacon Medical Supplies Ltd', brand: 'OralCure', batch_number: 'BCH-2025-01', manufacturing_date: '2025-01-25', expiry_date: '2026-12-25', purchase_price: 85.00, selling_price: 130.00, stock_quantity: 18, reorder_level: 8, unit: 'Bottle', rack_number: 'Rack E-2', description: 'Alcohol-free dental germicidal rinse for plaque control.', status: 'active' },
    { id: 25, product_code: 'MED-BC-001', product_name: 'Zinc Oxide Soothing Diaper Rash Cream 75g', category_id: 6, category_name: 'Baby Care', supplier_id: 8, company_name: 'Horizon Pediatric & Baby Care', brand: 'BabySoft', batch_number: 'BCH-2025-01', manufacturing_date: '2025-01-14', expiry_date: '2027-01-14', purchase_price: 110.00, selling_price: 169.00, stock_quantity: 42, reorder_level: 12, unit: 'Tube', rack_number: 'Rack F-1', description: 'Gentle barrier cream fortified with 15% micro-fine zinc oxide.', status: 'active' },
    { id: 26, product_code: 'MED-BC-002', product_name: 'Hypoallergenic 99% Pure Water Baby Wipes (72 Wipes)', category_id: 6, category_name: 'Baby Care', supplier_id: 8, company_name: 'Horizon Pediatric & Baby Care', brand: 'AquaBaby', batch_number: 'BCH-2025-02', manufacturing_date: '2025-02-01', expiry_date: '2027-02-01', purchase_price: 90.00, selling_price: 135.00, stock_quantity: 50, reorder_level: 15, unit: 'Pouch (72 Wipes)', rack_number: 'Rack F-1', description: 'Biodegradable non-woven fabric wipes infused with chamomile.', status: 'active' },
    { id: 27, product_code: 'MED-BC-003', product_name: 'Ayurvedic Gripe Water Colic Relief 150ml', category_id: 6, category_name: 'Baby Care', supplier_id: 8, company_name: 'Horizon Pediatric & Baby Care', brand: 'TinyTummy', batch_number: 'BCH-2024-11', manufacturing_date: '2024-11-05', expiry_date: '2026-11-05', purchase_price: 48.00, selling_price: 75.00, stock_quantity: 7, reorder_level: 10, unit: 'Glass Bottle', rack_number: 'Rack F-2', description: 'Alcohol-free dill and fennel extract syrup for infants stomach gas.', status: 'active' },
    { id: 28, product_code: 'MED-BC-004', product_name: 'Pediatric Electrolyte Oral Hydration Solution 200ml', category_id: 6, category_name: 'Baby Care', supplier_id: 8, company_name: 'Horizon Pediatric & Baby Care', brand: 'PedioLyte', batch_number: 'BCH-2025-03', manufacturing_date: '2025-03-10', expiry_date: '2026-09-10', purchase_price: 32.00, selling_price: 49.00, stock_quantity: 3, reorder_level: 15, unit: 'Tetrapack', rack_number: 'Rack F-2', description: 'WHO-compliant ready-to-drink oral rehydration solution in apple flavor.', status: 'active' },
    { id: 29, product_code: 'MED-EC-001', product_name: 'Adult Incontinence Tape Diapers Large (Pack of 10)', category_id: 7, category_name: 'Elder Care', supplier_id: 9, company_name: 'Imperial ElderCare Products', brand: 'SeniorDignity', batch_number: 'BCH-2025-01', manufacturing_date: '2025-01-18', expiry_date: '2028-01-18', purchase_price: 340.00, selling_price: 499.00, stock_quantity: 36, reorder_level: 10, unit: 'Pack (10 Diapers)', rack_number: 'Rack G-1', description: 'Super absorbent polymer dual-core briefs with wetness indicator.', status: 'active' },
    { id: 30, product_code: 'MED-EC-002', product_name: 'Orthopedic Lumbo Sacral Back Support Belt (Size L)', category_id: 7, category_name: 'Elder Care', supplier_id: 9, company_name: 'Imperial ElderCare Products', brand: 'SpineCare', batch_number: 'BCH-2025-02', manufacturing_date: '2025-02-22', expiry_date: '2030-02-22', purchase_price: 420.00, selling_price: 649.00, stock_quantity: 16, reorder_level: 6, unit: 'Box', rack_number: 'Rack G-1', description: 'Double pull breathable elastic abdominal binder with splints.', status: 'active' },
    { id: 31, product_code: 'MED-EC-003', product_name: 'Adjustable Quad-Base Anti-Slip Walking Cane', category_id: 7, category_name: 'Elder Care', supplier_id: 9, company_name: 'Imperial ElderCare Products', brand: 'WalkMaster', batch_number: 'BCH-2025-03', manufacturing_date: '2025-03-01', expiry_date: '2030-03-01', purchase_price: 380.00, selling_price: 580.00, stock_quantity: 8, reorder_level: 5, unit: 'Unit', rack_number: 'Rack G-2', description: 'Lightweight aluminum cane with 4-point rubber feet.', status: 'active' },
    { id: 32, product_code: 'MED-EC-004', product_name: 'Electric Heating Pad for Joint & Muscle Stiffness', category_id: 7, category_name: 'Elder Care', supplier_id: 9, company_name: 'Imperial ElderCare Products', brand: 'ComfortTherapy', batch_number: 'BCH-2024-12', manufacturing_date: '2024-12-05', expiry_date: '2029-12-05', purchase_price: 490.00, selling_price: 750.00, stock_quantity: 11, reorder_level: 4, unit: 'Unit Box', rack_number: 'Rack G-2', description: 'Washable orthopedic heating pad with 3 thermostatically controlled levels.', status: 'active' }
  ],
  customers: [
    { id: 1, customer_name: 'Aarav Patel', email: 'aarav.patel@gmail.com', phone: '+91 98200 12345', date_of_birth: '1988-04-12', address: 'Flat 402, Sunshine Heights, Juhu', city: 'Mumbai', state: 'Maharashtra', pincode: '400049', order_count: 1, total_spent: 415.00 },
    { id: 2, customer_name: 'Priya Sharma', email: 'priya.sharma@yahoo.com', phone: '+91 98111 23456', date_of_birth: '1992-09-25', address: 'B-12 Greenwood Apartments, Indirapuram', city: 'Ghaziabad', state: 'Uttar Pradesh', pincode: '201014', order_count: 1, total_spent: 584.00 },
    { id: 3, customer_name: 'Rohan Verma', email: 'rohan.verma@outlook.com', phone: '+91 97410 34567', date_of_birth: '1985-11-18', address: '74, 5th Main Road, Indiranagar', city: 'Bengaluru', state: 'Karnataka', pincode: '560038', order_count: 1, total_spent: 2019.00 },
    { id: 4, customer_name: 'Sneha Mukherjee', email: 'sneha.m@rediffmail.com', phone: '+91 98301 45678', date_of_birth: '1990-07-03', address: '21B Lake View Road, Ballygunge', city: 'Kolkata', state: 'West Bengal', pincode: '700029', order_count: 1, total_spent: 1099.00 },
    { id: 5, customer_name: 'Vikramaditya Rao', email: 'vikram.rao@gmail.com', phone: '+91 98490 56789', date_of_birth: '1979-02-14', address: 'Plot 88, Jubilee Hills Road No 36', city: 'Hyderabad', state: 'Telangana', pincode: '500033', order_count: 1, total_spent: 1698.00 },
    { id: 6, customer_name: 'Ananya Sundaram', email: 'ananya.sundaram@gmail.com', phone: '+91 98401 67890', date_of_birth: '1995-12-30', address: '14 Besant Avenue, Adyar', city: 'Chennai', state: 'Tamil Nadu', pincode: '600020', order_count: 1, total_spent: 439.00 },
    { id: 7, customer_name: 'Kabir Mehta', email: 'kabir.mehta@gmail.com', phone: '+91 98251 78901', date_of_birth: '1983-06-22', address: '12 Prernatirth Derasar Road, Satellite', city: 'Ahmedabad', state: 'Gujarat', pincode: '380015', order_count: 1, total_spent: 699.00 },
    { id: 8, customer_name: 'Divya Nair', email: 'divya.nair@hotmail.com', phone: '+91 94471 89012', date_of_birth: '1991-08-19', address: 'Palm Grove Villa 5, Panampilly Nagar', city: 'Kochi', state: 'Kerala', pincode: '682036', order_count: 1, total_spent: 379.00 },
    { id: 9, customer_name: 'Arjun Singh', email: 'arjun.singh@gmail.com', phone: '+91 98140 90123', date_of_birth: '1987-03-08', address: 'House 142 Sector 11-A', city: 'Chandigarh', state: 'Punjab', pincode: '160011', order_count: 0, total_spent: 0.00 },
    { id: 10, customer_name: 'Meera Kulkarni', email: 'meera.kulkarni@gmail.com', phone: '+91 98902 01234', date_of_birth: '1993-10-11', address: '89 Mayur Colony, Kothrud', city: 'Pune', state: 'Maharashtra', pincode: '411038', order_count: 1, total_spent: 1229.00 },
    { id: 11, customer_name: 'Gaurav Joshi', email: 'gaurav.joshi@gmail.com', phone: '+91 94140 12345', date_of_birth: '1986-05-17', address: 'C-48 Malviya Nagar', city: 'Jaipur', state: 'Rajasthan', pincode: '302017', order_count: 0, total_spent: 0.00 },
    { id: 12, customer_name: 'Tanvi Saxena', email: 'tanvi.saxena@gmail.com', phone: '+91 94151 23456', date_of_birth: '1994-01-28', address: '24 Gomti Nagar Extension', city: 'Lucknow', state: 'Uttar Pradesh', pincode: '226010', order_count: 1, total_spent: 548.00 },
    { id: 13, customer_name: 'Siddharth Iyer', email: 'sid.iyer@gmail.com', phone: '+91 98203 34567', date_of_birth: '1982-11-04', address: '601 Oberoi Exquisite, Goregaon East', city: 'Mumbai', state: 'Maharashtra', pincode: '400063', order_count: 1, total_spent: 1748.00 },
    { id: 14, customer_name: 'Ishita Roy', email: 'ishita.roy@gmail.com', phone: '+91 98312 45678', date_of_birth: '1996-03-15', address: 'Block C New Town Action Area 1', city: 'Kolkata', state: 'West Bengal', pincode: '700156', order_count: 0, total_spent: 0.00 },
    { id: 15, customer_name: 'Rajeev Nambiar', email: 'rajeev.n@gmail.com', phone: '+91 94462 56789', date_of_birth: '1975-09-09', address: 'Chithra Lane, Kowdiar', city: 'Thiruvananthapuram', state: 'Kerala', pincode: '695003', order_count: 0, total_spent: 0.00 },
    { id: 16, customer_name: 'Kritika Sen', email: 'kritika.sen@gmail.com', phone: '+91 98103 67890', date_of_birth: '1997-07-21', address: 'A-304 DLF Phase 5', city: 'Gurugram', state: 'Haryana', pincode: '122009', order_count: 1, total_spent: 304.00 },
    { id: 17, customer_name: 'Naveen Reddy', email: 'naveen.reddy@gmail.com', phone: '+91 98481 78901', date_of_birth: '1989-12-05', address: 'H.No 3-6-412 Himayatnagar', city: 'Hyderabad', state: 'Telangana', pincode: '500029', order_count: 0, total_spent: 0.00 },
    { id: 18, customer_name: 'Bhavna Dave', email: 'bhavna.dave@gmail.com', phone: '+91 98242 89012', date_of_birth: '1981-04-30', address: '7 Race Course Road', city: 'Vadodara', state: 'Gujarat', pincode: '390007', order_count: 0, total_spent: 0.00 },
    { id: 19, customer_name: 'Alok Gupta', email: 'alok.gupta@gmail.com', phone: '+91 94250 90123', date_of_birth: '1984-08-14', address: '18 South Tukoganj', city: 'Indore', state: 'Madhya Pradesh', pincode: '452001', order_count: 0, total_spent: 0.00 },
    { id: 20, customer_name: 'Shalini Menon', email: 'shalini.menon@gmail.com', phone: '+91 97422 01234', date_of_birth: '1990-06-25', address: 'Villa 12, Koramangala 4th Block', city: 'Bengaluru', state: 'Karnataka', pincode: '560034', order_count: 0, total_spent: 0.00 }
  ],
  orders: [
    { id: 1, customer_id: 1, customer_name: 'Aarav Patel', customer_phone: '+91 98200 12345', order_date: '2026-03-20 10:15:00', total_amount: 415.00, payment_method: 'UPI', order_status: 'Completed', delivery_address: 'Flat 402, Sunshine Heights, Juhu, Mumbai', item_count: 2, items: [
      { id: 1, product_id: 1, product_code: 'MED-PR-001', product_name: 'Diclofenac Fast Relief Gel 30g', batch_number: 'BCH-2025-01', unit: 'Tube', quantity: 1, unit_price: 95.00, subtotal: 95.00 },
      { id: 2, product_id: 6, product_code: 'MED-VS-001', product_name: 'Daily Multivitamin & Minerals (60 Tabs)', batch_number: 'BCH-2025-02', unit: 'Bottle', quantity: 1, unit_price: 320.00, subtotal: 320.00 }
    ]},
    { id: 2, customer_id: 3, customer_name: 'Rohan Verma', customer_phone: '+91 97410 34567', order_date: '2026-03-20 14:30:00', total_amount: 2019.00, payment_method: 'Card', order_status: 'Completed', delivery_address: '74, 5th Main Road, Indiranagar, Bengaluru', item_count: 2, items: [
      { id: 3, product_id: 16, product_code: 'MED-HD-001', product_name: 'Digital Upper Arm Blood Pressure Monitor', batch_number: 'BCH-2025-01', unit: 'Device Unit', quantity: 1, unit_price: 1699.00, subtotal: 1699.00 },
      { id: 4, product_id: 6, product_code: 'MED-VS-001', product_name: 'Daily Multivitamin & Minerals (60 Tabs)', batch_number: 'BCH-2025-02', unit: 'Bottle', quantity: 1, unit_price: 320.00, subtotal: 320.00 }
    ]},
    { id: 3, customer_id: 2, customer_name: 'Priya Sharma', customer_phone: '+91 98111 23456', order_date: '2026-03-21 09:45:00', total_amount: 584.00, payment_method: 'Cash', order_status: 'Completed', delivery_address: 'B-12 Greenwood Apartments, Indirapuram, Ghaziabad', item_count: 3, items: [
      { id: 5, product_id: 11, product_code: 'MED-FA-001', product_name: 'Sterile Adhesive Waterproof Bandages (Pack of 50)', batch_number: 'BCH-2025-01', unit: 'Box', quantity: 2, unit_price: 89.00, subtotal: 178.00 },
      { id: 6, product_id: 12, product_code: 'MED-FA-002', product_name: 'Povidone Iodine Antiseptic Solution 100ml', batch_number: 'BCH-2025-02', unit: 'Bottle', quantity: 1, unit_price: 95.00, subtotal: 95.00 },
      { id: 7, product_id: 22, product_code: 'MED-PC-002', product_name: 'Moisturizing Ceramide Barrier Lotion 200ml', batch_number: 'BCH-2025-03', unit: 'Bottle', quantity: 1, unit_price: 311.00, subtotal: 311.00 }
    ]},
    { id: 4, customer_id: 5, customer_name: 'Vikramaditya Rao', customer_phone: '+91 98490 56789', order_date: '2026-03-21 16:20:00', total_amount: 1698.00, payment_method: 'UPI', order_status: 'Processing', delivery_address: 'Plot 88, Jubilee Hills Road No 36, Hyderabad', item_count: 3, items: [
      { id: 8, product_id: 29, product_code: 'MED-EC-001', product_name: 'Adult Incontinence Tape Diapers Large (Pack of 10)', batch_number: 'BCH-2025-01', unit: 'Pack', quantity: 2, unit_price: 499.00, subtotal: 998.00 },
      { id: 9, product_id: 31, product_code: 'MED-EC-003', product_name: 'Adjustable Quad-Base Anti-Slip Walking Cane', batch_number: 'BCH-2025-03', unit: 'Unit', quantity: 1, unit_price: 580.00, subtotal: 580.00 },
      { id: 10, product_id: 1, product_code: 'MED-PR-001', product_name: 'Diclofenac Fast Relief Gel 30g', batch_number: 'BCH-2025-01', unit: 'Tube', quantity: 1, unit_price: 120.00, subtotal: 120.00 }
    ]},
    { id: 5, customer_id: 6, customer_name: 'Ananya Sundaram', customer_phone: '+91 98401 67890', order_date: '2026-03-22 11:10:00', total_amount: 439.00, payment_method: 'Card', order_status: 'Confirmed', delivery_address: '14 Besant Avenue, Adyar, Chennai', item_count: 2, items: [
      { id: 11, product_id: 25, product_code: 'MED-BC-001', product_name: 'Zinc Oxide Soothing Diaper Rash Cream 75g', batch_number: 'BCH-2025-01', unit: 'Tube', quantity: 2, unit_price: 169.00, subtotal: 338.00 },
      { id: 12, product_id: 26, product_code: 'MED-BC-002', product_name: 'Hypoallergenic 99% Pure Water Baby Wipes (72 Wipes)', batch_number: 'BCH-2025-02', unit: 'Pouch', quantity: 1, unit_price: 101.00, subtotal: 101.00 }
    ]},
    { id: 6, customer_id: 4, customer_name: 'Sneha Mukherjee', customer_phone: '+91 98301 45678', order_date: '2026-03-22 15:40:00', total_amount: 1099.00, payment_method: 'UPI', order_status: 'Pending', delivery_address: '21B Lake View Road, Ballygunge, Kolkata', item_count: 1, items: [
      { id: 13, product_id: 19, product_code: 'MED-HD-004', product_name: 'Blood Glucose Monitoring Starter Kit (with 25 Strips)', batch_number: 'BCH-2024-11', unit: 'Kit', quantity: 1, unit_price: 1099.00, subtotal: 1099.00 }
    ]},
    { id: 7, customer_id: 8, customer_name: 'Divya Nair', customer_phone: '+91 94471 89012', order_date: '2026-03-22 18:05:00', total_amount: 379.00, payment_method: 'Cash', order_status: 'Pending', delivery_address: 'Palm Grove Villa 5, Panampilly Nagar, Kochi', item_count: 1, items: [
      { id: 14, product_id: 21, product_code: 'MED-PC-001', product_name: 'Broad Spectrum Sunscreen Gel SPF 50 PA++++ 50g', batch_number: 'BCH-2025-02', unit: 'Tube', quantity: 1, unit_price: 379.00, subtotal: 379.00 }
    ]},
    { id: 8, customer_id: 10, customer_name: 'Meera Kulkarni', customer_phone: '+91 98902 01234', order_date: '2026-03-23 08:30:00', total_amount: 1229.00, payment_method: 'UPI', order_status: 'Processing', delivery_address: '89 Mayur Colony, Kothrud, Pune', item_count: 2, items: [
      { id: 15, product_id: 30, product_code: 'MED-EC-002', product_name: 'Orthopedic Lumbo Sacral Back Support Belt (Size L)', batch_number: 'BCH-2025-02', unit: 'Box', quantity: 1, unit_price: 649.00, subtotal: 649.00 },
      { id: 16, product_id: 31, product_code: 'MED-EC-003', product_name: 'Adjustable Quad-Base Anti-Slip Walking Cane', batch_number: 'BCH-2025-03', unit: 'Unit', quantity: 1, unit_price: 580.00, subtotal: 580.00 }
    ]},
    { id: 9, customer_id: 7, customer_name: 'Kabir Mehta', customer_phone: '+91 98251 78901', order_date: '2026-03-23 09:15:00', total_amount: 699.00, payment_method: 'Card', order_status: 'Confirmed', delivery_address: '12 Prernatirth Derasar Road, Satellite, Ahmedabad', item_count: 1, items: [
      { id: 17, product_id: 17, product_code: 'MED-HD-002', product_name: 'Fingertip LED Pulse Oximeter', batch_number: 'BCH-2025-02', unit: 'Unit', quantity: 1, unit_price: 699.00, subtotal: 699.00 }
    ]},
    { id: 10, customer_id: 12, customer_name: 'Tanvi Saxena', customer_phone: '+91 94151 23456', order_date: '2026-03-23 10:00:00', total_amount: 548.00, payment_method: 'Cash', order_status: 'Pending', delivery_address: '24 Gomti Nagar Extension, Lucknow', item_count: 1, items: [
      { id: 18, product_id: 8, product_code: 'MED-VS-003', product_name: 'Omega-3 Deep Sea Fish Oil 1000mg (60 Softgels)', batch_number: 'BCH-2025-04', unit: 'Bottle', quantity: 1, unit_price: 548.00, subtotal: 548.00 }
    ]}
  ]
};

// =========================================================================
// UNIFIED MEDICARE API CLIENT
// =========================================================================
const MedicareAPI = {
  phpApiBase: 'php-backend/api',
  usePhpBackend: null, // auto-detected on first test

  STORAGE_KEY: 'medicare_management_db_v1',

  getStore() {
    let raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) {
      this.resetDatabase();
      raw = localStorage.getItem(this.STORAGE_KEY);
    }
    return JSON.parse(raw);
  },

  setStore(data) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  },

  resetDatabase() {
    // Deep clone demo data
    const clone = JSON.parse(JSON.stringify(INITIAL_DEMO_DATA));
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(clone));
  },

  async testPhpApi() {
    if (this.usePhpBackend !== null) return this.usePhpBackend;
    try {
      const res = await fetch(`${this.phpApiBase}/dashboard.php`, { method: 'GET', headers: { 'Accept': 'application/json' } });
      if (res.ok) {
        const json = await res.json();
        if (json && json.success) {
          this.usePhpBackend = true;
          this.updateBackendBadge(true);
          return true;
        }
      }
    } catch (e) {
      // PHP not running or static environment
    }
    this.usePhpBackend = false;
    this.updateBackendBadge(false);
    return false;
  },

  updateBackendBadge(isPhp) {
    const badge = document.getElementById('backend-status-badge');
    if (badge) {
      if (isPhp) {
        badge.innerHTML = `<i class="bi bi-hdd-network text-success"></i> Connected to PHP PDO / MySQL (XAMPP)`;
        badge.className = 'badge bg-success-subtle text-success border border-success-subtle';
      } else {
        badge.innerHTML = `<i class="bi bi-cpu text-info"></i> In-Browser SQL Engine (XAMPP Ready)`;
        badge.className = 'badge bg-info-subtle text-info border border-info-subtle';
      }
    }
  },

  // ---------------- PRODUCTS ----------------
  async getProducts() {
    const isPhp = await this.testPhpApi();
    if (isPhp) {
      const res = await fetch(`${this.phpApiBase}/products.php`);
      return res.json();
    }

    const store = this.getStore();
    return { success: true, count: store.products.length, data: store.products };
  },

  async getProduct(id) {
    const isPhp = await this.testPhpApi();
    if (isPhp) {
      const res = await fetch(`${this.phpApiBase}/products.php?id=${id}`);
      return res.json();
    }
    const store = this.getStore();
    const prod = store.products.find(p => p.id == id);
    return prod ? { success: true, data: prod } : { success: false, message: 'Product not found' };
  },

  async createProduct(data) {
    const isPhp = await this.testPhpApi();
    if (isPhp) {
      const res = await fetch(`${this.phpApiBase}/products.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    }

    const store = this.getStore();
    // duplicate code check
    if (store.products.some(p => p.product_code.toLowerCase() === data.product_code.trim().toLowerCase())) {
      return { success: false, message: 'Product code already exists', errors: { product_code: 'Duplicate product code' } };
    }

    const cat = store.categories.find(c => c.id == data.category_id);
    const sup = store.suppliers.find(s => s.id == data.supplier_id);

    const newId = store.products.length > 0 ? Math.max(...store.products.map(p => p.id)) + 1 : 1;
    const newProd = {
      id: newId,
      product_code: data.product_code.trim(),
      product_name: data.product_name.trim(),
      category_id: parseInt(data.category_id, 10),
      category_name: cat ? cat.category_name : 'N/A',
      supplier_id: parseInt(data.supplier_id, 10),
      company_name: sup ? sup.company_name : 'N/A',
      brand: data.brand.trim(),
      batch_number: data.batch_number.trim(),
      manufacturing_date: data.manufacturing_date,
      expiry_date: data.expiry_date,
      purchase_price: parseFloat(data.purchase_price),
      selling_price: parseFloat(data.selling_price),
      stock_quantity: parseInt(data.stock_quantity, 10),
      reorder_level: parseInt(data.reorder_level || 10, 10),
      unit: data.unit || 'Pack',
      rack_number: data.rack_number || 'Rack A-1',
      description: data.description || '',
      status: data.status || 'active'
    };

    store.products.unshift(newProd);
    this.setStore(store);
    return { success: true, message: 'Product added successfully.', product_id: newId };
  },

  async updateProduct(id, data) {
    const isPhp = await this.testPhpApi();
    if (isPhp) {
      const res = await fetch(`${this.phpApiBase}/products.php?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    }

    const store = this.getStore();
    const idx = store.products.findIndex(p => p.id == id);
    if (idx === -1) return { success: false, message: 'Product not found' };

    // Duplicate check
    const dup = store.products.some(p => p.id != id && p.product_code.toLowerCase() === data.product_code.trim().toLowerCase());
    if (dup) {
      return { success: false, message: 'Product code already in use by another item', errors: { product_code: 'Duplicate code' } };
    }

    const cat = store.categories.find(c => c.id == data.category_id);
    const sup = store.suppliers.find(s => s.id == data.supplier_id);

    store.products[idx] = {
      ...store.products[idx],
      product_code: data.product_code.trim(),
      product_name: data.product_name.trim(),
      category_id: parseInt(data.category_id, 10),
      category_name: cat ? cat.category_name : store.products[idx].category_name,
      supplier_id: parseInt(data.supplier_id, 10),
      company_name: sup ? sup.company_name : store.products[idx].company_name,
      brand: data.brand.trim(),
      batch_number: data.batch_number.trim(),
      manufacturing_date: data.manufacturing_date,
      expiry_date: data.expiry_date,
      purchase_price: parseFloat(data.purchase_price),
      selling_price: parseFloat(data.selling_price),
      stock_quantity: parseInt(data.stock_quantity, 10),
      reorder_level: parseInt(data.reorder_level || 10, 10),
      unit: data.unit || 'Pack',
      rack_number: data.rack_number || 'Rack A-1',
      description: data.description || '',
      status: data.status || 'active'
    };

    this.setStore(store);
    return { success: true, message: 'Product updated successfully.' };
  },

  async deleteProduct(id) {
    const isPhp = await this.testPhpApi();
    if (isPhp) {
      const res = await fetch(`${this.phpApiBase}/products.php?id=${id}`, { method: 'DELETE' });
      return res.json();
    }

    const store = this.getStore();
    const idx = store.products.findIndex(p => p.id == id);
    if (idx === -1) return { success: false, message: 'Product not found' };

    // Check if referenced in any order items
    const inOrders = store.orders.some(o => (o.items || []).some(item => item.product_id == id));
    if (inOrders) {
      return { success: false, message: 'Cannot delete product because it has been ordered in historical transactions. Inactive status recommended.' };
    }

    store.products.splice(idx, 1);
    this.setStore(store);
    return { success: true, message: 'Product deleted successfully.' };
  },

  // ---------------- CATEGORIES ----------------
  async getCategories() {
    const isPhp = await this.testPhpApi();
    if (isPhp) {
      const res = await fetch(`${this.phpApiBase}/categories.php`);
      return res.json();
    }
    const store = this.getStore();
    // recount products per category
    store.categories.forEach(c => {
      c.product_count = store.products.filter(p => p.category_id == c.id).length;
    });
    return { success: true, count: store.categories.length, data: store.categories };
  },

  async getCategory(id) {
    const isPhp = await this.testPhpApi();
    if (isPhp) {
      const res = await fetch(`${this.phpApiBase}/categories.php?id=${id}`);
      return res.json();
    }
    const store = this.getStore();
    const c = store.categories.find(item => item.id == id);
    return c ? { success: true, data: c } : { success: false, message: 'Category not found' };
  },

  async createCategory(data) {
    const isPhp = await this.testPhpApi();
    if (isPhp) {
      const res = await fetch(`${this.phpApiBase}/categories.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    }

    const store = this.getStore();
    const name = data.category_name.trim();
    if (store.categories.some(c => c.category_name.toLowerCase() === name.toLowerCase())) {
      return { success: false, message: 'Category name already exists', errors: { category_name: 'Duplicate name' } };
    }

    const newId = store.categories.length > 0 ? Math.max(...store.categories.map(c => c.id)) + 1 : 1;
    store.categories.push({
      id: newId,
      category_name: name,
      description: data.description || '',
      status: data.status || 'active',
      product_count: 0
    });
    this.setStore(store);
    return { success: true, message: 'Category created successfully.', category_id: newId };
  },

  async updateCategory(id, data) {
    const isPhp = await this.testPhpApi();
    if (isPhp) {
      const res = await fetch(`${this.phpApiBase}/categories.php?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    }

    const store = this.getStore();
    const idx = store.categories.findIndex(c => c.id == id);
    if (idx === -1) return { success: false, message: 'Category not found' };

    store.categories[idx] = {
      ...store.categories[idx],
      category_name: data.category_name.trim(),
      description: data.description || '',
      status: data.status || 'active'
    };
    this.setStore(store);
    return { success: true, message: 'Category updated successfully.' };
  },

  async deleteCategory(id) {
    const isPhp = await this.testPhpApi();
    if (isPhp) {
      const res = await fetch(`${this.phpApiBase}/categories.php?id=${id}`, { method: 'DELETE' });
      return res.json();
    }

    const store = this.getStore();
    const count = store.products.filter(p => p.category_id == id).length;
    if (count > 0) {
      return { success: false, message: `Cannot delete category because ${count} product(s) are associated with it.` };
    }

    store.categories = store.categories.filter(c => c.id != id);
    this.setStore(store);
    return { success: true, message: 'Category deleted successfully.' };
  },

  // ---------------- SUPPLIERS ----------------
  async getSuppliers() {
    const isPhp = await this.testPhpApi();
    if (isPhp) {
      const res = await fetch(`${this.phpApiBase}/suppliers.php`);
      return res.json();
    }
    const store = this.getStore();
    store.suppliers.forEach(s => {
      s.product_count = store.products.filter(p => p.supplier_id == s.id).length;
    });
    return { success: true, count: store.suppliers.length, data: store.suppliers };
  },

  async getSupplier(id) {
    const isPhp = await this.testPhpApi();
    if (isPhp) {
      const res = await fetch(`${this.phpApiBase}/suppliers.php?id=${id}`);
      return res.json();
    }
    const store = this.getStore();
    const s = store.suppliers.find(item => item.id == id);
    return s ? { success: true, data: s } : { success: false, message: 'Supplier not found' };
  },

  async createSupplier(data) {
    const isPhp = await this.testPhpApi();
    if (isPhp) {
      const res = await fetch(`${this.phpApiBase}/suppliers.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    }

    const store = this.getStore();
    if (store.suppliers.some(s => s.email.toLowerCase() === data.email.trim().toLowerCase())) {
      return { success: false, message: 'Email already registered for a supplier', errors: { email: 'Duplicate supplier email' } };
    }

    const newId = store.suppliers.length > 0 ? Math.max(...store.suppliers.map(s => s.id)) + 1 : 1;
    store.suppliers.push({
      id: newId,
      supplier_name: data.supplier_name.trim(),
      company_name: data.company_name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      gst_number: (data.gst_number || '').trim(),
      address: data.address.trim(),
      status: data.status || 'active',
      product_count: 0
    });
    this.setStore(store);
    return { success: true, message: 'Supplier registered successfully.', supplier_id: newId };
  },

  async updateSupplier(id, data) {
    const isPhp = await this.testPhpApi();
    if (isPhp) {
      const res = await fetch(`${this.phpApiBase}/suppliers.php?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    }

    const store = this.getStore();
    const idx = store.suppliers.findIndex(s => s.id == id);
    if (idx === -1) return { success: false, message: 'Supplier not found' };

    store.suppliers[idx] = {
      ...store.suppliers[idx],
      supplier_name: data.supplier_name.trim(),
      company_name: data.company_name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      gst_number: (data.gst_number || '').trim(),
      address: data.address.trim(),
      status: data.status || 'active'
    };
    this.setStore(store);
    return { success: true, message: 'Supplier updated successfully.' };
  },

  async deleteSupplier(id) {
    const isPhp = await this.testPhpApi();
    if (isPhp) {
      const res = await fetch(`${this.phpApiBase}/suppliers.php?id=${id}`, { method: 'DELETE' });
      return res.json();
    }

    const store = this.getStore();
    const count = store.products.filter(p => p.supplier_id == id).length;
    if (count > 0) {
      return { success: false, message: `Cannot delete supplier because ${count} product(s) are supplied by them.` };
    }

    store.suppliers = store.suppliers.filter(s => s.id != id);
    this.setStore(store);
    return { success: true, message: 'Supplier deleted successfully.' };
  },

  // ---------------- CUSTOMERS ----------------
  async getCustomers() {
    const isPhp = await this.testPhpApi();
    if (isPhp) {
      const res = await fetch(`${this.phpApiBase}/customers.php`);
      return res.json();
    }
    const store = this.getStore();
    return { success: true, count: store.customers.length, data: store.customers };
  },

  async getCustomer(id) {
    const isPhp = await this.testPhpApi();
    if (isPhp) {
      const res = await fetch(`${this.phpApiBase}/customers.php?id=${id}`);
      return res.json();
    }
    const store = this.getStore();
    const c = store.customers.find(item => item.id == id);
    return c ? { success: true, data: c } : { success: false, message: 'Customer not found' };
  },

  async createCustomer(data) {
    const isPhp = await this.testPhpApi();
    if (isPhp) {
      const res = await fetch(`${this.phpApiBase}/customers.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    }

    const store = this.getStore();
    const newId = store.customers.length > 0 ? Math.max(...store.customers.map(c => c.id)) + 1 : 1;
    store.customers.push({
      id: newId,
      customer_name: data.customer_name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      date_of_birth: data.date_of_birth || '',
      address: data.address.trim(),
      city: data.city.trim(),
      state: data.state.trim(),
      pincode: data.pincode.trim(),
      order_count: 0,
      total_spent: 0.00
    });
    this.setStore(store);
    return { success: true, message: 'Customer added successfully.', customer_id: newId };
  },

  async updateCustomer(id, data) {
    const isPhp = await this.testPhpApi();
    if (isPhp) {
      const res = await fetch(`${this.phpApiBase}/customers.php?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    }

    const store = this.getStore();
    const idx = store.customers.findIndex(c => c.id == id);
    if (idx === -1) return { success: false, message: 'Customer not found' };

    store.customers[idx] = {
      ...store.customers[idx],
      customer_name: data.customer_name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      date_of_birth: data.date_of_birth || '',
      address: data.address.trim(),
      city: data.city.trim(),
      state: data.state.trim(),
      pincode: data.pincode.trim()
    };
    this.setStore(store);
    return { success: true, message: 'Customer updated successfully.' };
  },

  async deleteCustomer(id) {
    const isPhp = await this.testPhpApi();
    if (isPhp) {
      const res = await fetch(`${this.phpApiBase}/customers.php?id=${id}`, { method: 'DELETE' });
      return res.json();
    }

    const store = this.getStore();
    const hasOrders = store.orders.some(o => o.customer_id == id);
    if (hasOrders) {
      return { success: false, message: 'Cannot delete customer because orders are on record for them.' };
    }

    store.customers = store.customers.filter(c => c.id != id);
    this.setStore(store);
    return { success: true, message: 'Customer deleted successfully.' };
  },

  // ---------------- ORDERS ----------------
  async getOrders() {
    const isPhp = await this.testPhpApi();
    if (isPhp) {
      const res = await fetch(`${this.phpApiBase}/orders.php`);
      return res.json();
    }
    const store = this.getStore();
    return { success: true, count: store.orders.length, data: store.orders };
  },

  async getOrder(id) {
    const isPhp = await this.testPhpApi();
    if (isPhp) {
      const res = await fetch(`${this.phpApiBase}/orders.php?id=${id}`);
      return res.json();
    }
    const store = this.getStore();
    const ord = store.orders.find(o => o.id == id);
    return ord ? { success: true, data: ord } : { success: false, message: 'Order not found' };
  },

  async createOrder(data) {
    const isPhp = await this.testPhpApi();
    if (isPhp) {
      const res = await fetch(`${this.phpApiBase}/orders.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    }

    const store = this.getStore();
    const cust = store.customers.find(c => c.id == data.customer_id);
    if (!cust) return { success: false, message: 'Customer not found' };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let totalAmount = 0;
    const processedItems = [];

    // Verify each product, reject expired, check stock
    for (const item of data.items) {
      const prod = store.products.find(p => p.id == item.product_id);
      if (!prod) return { success: false, message: `Product ID #${item.product_id} not found` };

      // Expiry check
      const expDate = new Date(prod.expiry_date);
      if (expDate < today) {
        return { success: false, message: `Product '${prod.product_name}' (${prod.product_code}) is EXPIRED and cannot be sold.` };
      }

      // Stock check
      if (prod.stock_quantity < item.quantity) {
        return { success: false, message: `Insufficient stock for '${prod.product_name}'. Requested: ${item.quantity}, In-Stock: ${prod.stock_quantity}` };
      }

      const subtotal = prod.selling_price * item.quantity;
      totalAmount += subtotal;

      processedItems.push({
        id: Date.now() + Math.floor(Math.random() * 1000),
        product_id: prod.id,
        product_code: prod.product_code,
        product_name: prod.product_name,
        brand: prod.brand,
        batch_number: prod.batch_number,
        unit: prod.unit,
        quantity: item.quantity,
        unit_price: prod.selling_price,
        subtotal: subtotal
      });

      // Deduct inventory stock
      prod.stock_quantity -= item.quantity;
    }

    const newOrderId = store.orders.length > 0 ? Math.max(...store.orders.map(o => o.id)) + 1 : 1;
    const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newOrder = {
      id: newOrderId,
      customer_id: cust.id,
      customer_name: cust.customer_name,
      customer_phone: cust.phone,
      order_date: dateStr,
      total_amount: totalAmount,
      payment_method: data.payment_method || 'Cash',
      order_status: 'Confirmed',
      delivery_address: data.delivery_address || cust.address,
      item_count: processedItems.length,
      items: processedItems
    };

    store.orders.unshift(newOrder);

    // Update customer stats
    cust.order_count = (cust.order_count || 0) + 1;
    cust.total_spent = (cust.total_spent || 0) + totalAmount;

    this.setStore(store);
    return { success: true, message: `Order #ORD-${String(newOrderId).padStart(4, '0')} created successfully.`, order_id: newOrderId };
  },

  async updateOrderStatus(id, newStatus) {
    const isPhp = await this.testPhpApi();
    if (isPhp) {
      const res = await fetch(`${this.phpApiBase}/orders.php?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_status: newStatus })
      });
      return res.json();
    }

    const store = this.getStore();
    const ord = store.orders.find(o => o.id == id);
    if (!ord) return { success: false, message: 'Order not found' };

    ord.order_status = newStatus;
    this.setStore(store);
    return { success: true, message: `Order status changed to '${newStatus}'` };
  },

  // ---------------- DASHBOARD METRICS ----------------
  async getDashboard() {
    const isPhp = await this.testPhpApi();
    if (isPhp) {
      const res = await fetch(`${this.phpApiBase}/dashboard.php`);
      return res.json();
    }

    const store = this.getStore();
    const todayStr = new Date().toISOString().substring(0, 10);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalProducts = store.products.length;
    const totalCategories = store.categories.length;
    const totalSuppliers = store.suppliers.length;
    const totalCustomers = store.customers.length;
    const totalOrders = store.orders.length;
    const pendingOrders = store.orders.filter(o => o.order_status === 'Pending').length;
    const completedOrders = store.orders.filter(o => o.order_status === 'Completed').length;

    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalInventoryValue = 0;
    let expiredCount = 0;
    let expiringSoonCount = 0;

    const lowStockList = [];

    store.products.forEach(p => {
      totalInventoryValue += (p.stock_quantity * p.purchase_price);

      if (p.stock_quantity === 0) {
        outOfStockCount++;
        lowStockCount++;
        lowStockList.push({ ...p, status: 'Out of Stock' });
      } else if (p.stock_quantity <= p.reorder_level) {
        lowStockCount++;
        lowStockList.push({ ...p, status: 'Low Stock' });
      }

      const exp = new Date(p.expiry_date);
      const diff = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
      if (diff < 0) expiredCount++;
      else if (diff <= 30) expiringSoonCount++;
    });

    const todaysOrders = store.orders.filter(o => o.order_date.startsWith(todayStr) && o.order_status !== 'Cancelled');
    const todaySales = todaysOrders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0);

    return {
      success: true,
      data: {
        metrics: {
          total_products: totalProducts,
          total_categories: totalCategories,
          total_suppliers: totalSuppliers,
          total_customers: totalCustomers,
          total_orders: totalOrders,
          pending_orders: pendingOrders,
          completed_orders: completedOrders,
          low_stock_products: lowStockCount,
          out_of_stock_products: outOfStockCount,
          today_sales: todaySales,
          total_sales: store.orders.filter(o => o.order_status !== 'Cancelled').reduce((sum, o) => sum + parseFloat(o.total_amount), 0),
          total_inventory_value: totalInventoryValue,
          expired_count: expiredCount,
          expiring_soon_count: expiringSoonCount
        },
        recent_orders: store.orders.slice(0, 6),
        low_stock_products: lowStockList.slice(0, 8)
      }
    };
  }
};

window.MedicareAPI = MedicareAPI;

// =========================================================================
// MAIN MEDICARE APP CONTROLLER
// =========================================================================
const MedicareApp = {
  currentView: 'dashboard',

  init() {
    this.setupNavigation();
    this.setupQuickActions();

    // Initialize individual modules
    window.ProductsModule.init();
    window.CategoriesModule.init();
    window.SuppliersModule.init();
    window.CustomersModule.init();
    window.OrdersModule.init();

    // Initial load
    this.refreshAll();

    // Test API
    window.MedicareAPI.testPhpApi();
  },

  setupNavigation() {
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link[data-view]');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const view = link.getAttribute('data-view');
        this.switchView(view);

        // On mobile, close sidebar after clicking
        const sidebar = document.getElementById('app-sidebar');
        const backdrop = document.getElementById('sidebar-backdrop');
        if (sidebar && sidebar.classList.contains('show')) {
          sidebar.classList.remove('show');
          if (backdrop) backdrop.classList.add('d-none');
        }
      });
    });

    // Mobile sidebar toggle
    const toggleBtn = document.getElementById('btn-sidebar-toggle');
    const sidebar = document.getElementById('app-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');

    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('show');
        if (backdrop) backdrop.classList.toggle('d-none');
      });
    }

    if (backdrop) {
      backdrop.addEventListener('click', () => {
        sidebar.classList.remove('show');
        backdrop.classList.add('d-none');
      });
    }
  },

  setupQuickActions() {
    // Quick Add Product Button
    document.querySelectorAll('.btn-open-add-product').forEach(btn => {
      btn.addEventListener('click', () => {
        const form = document.getElementById('form-add-product');
        if (form) form.reset();
        window.FormValidator.clearErrors(form);
        new bootstrap.Modal(document.getElementById('modal-add-product')).show();
      });
    });

    // Quick New Order Button
    document.querySelectorAll('.btn-open-new-order').forEach(btn => {
      btn.addEventListener('click', () => {
        window.OrdersModule.openCreateOrderModal();
      });
    });

    // Quick Add Category Button
    document.querySelectorAll('.btn-open-add-category').forEach(btn => {
      btn.addEventListener('click', () => {
        const form = document.getElementById('form-add-category');
        if (form) form.reset();
        window.FormValidator.clearErrors(form);
        new bootstrap.Modal(document.getElementById('modal-add-category')).show();
      });
    });

    // Quick Add Supplier Button
    document.querySelectorAll('.btn-open-add-supplier').forEach(btn => {
      btn.addEventListener('click', () => {
        const form = document.getElementById('form-add-supplier');
        if (form) form.reset();
        window.FormValidator.clearErrors(form);
        new bootstrap.Modal(document.getElementById('modal-add-supplier')).show();
      });
    });

    // Quick Add Customer Button
    document.querySelectorAll('.btn-open-add-customer').forEach(btn => {
      btn.addEventListener('click', () => {
        const form = document.getElementById('form-add-customer');
        if (form) form.reset();
        window.FormValidator.clearErrors(form);
        new bootstrap.Modal(document.getElementById('modal-add-customer')).show();
      });
    });

    // Reset Demo Data Button
    const btnResetData = document.getElementById('btn-reset-demo-data');
    if (btnResetData) {
      btnResetData.addEventListener('click', () => {
        if (confirm('Reset entire system to default demonstration medical inventory and orders?')) {
          window.MedicareAPI.resetDatabase();
          this.showToast('System reset to default demo database.', 'success');
          this.refreshAll();
        }
      });
    }

    // Export SQL Backup Button
    const btnExportSql = document.getElementById('btn-export-sql');
    if (btnExportSql) {
      btnExportSql.addEventListener('click', () => {
        window.open('database/medicare_management.sql', '_blank');
      });
    }
  },

  switchView(viewName) {
    this.currentView = viewName;

    // Update active nav link
    document.querySelectorAll('.sidebar-nav .nav-link').forEach(l => {
      if (l.getAttribute('data-view') === viewName) l.classList.add('active');
      else l.classList.remove('active');
    });

    // Hide all view sections, display requested section
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.add('d-none');
    });

    const target = document.getElementById(`view-${viewName}`);
    if (target) {
      target.classList.remove('d-none');
    }

    // Trigger view-specific refreshes
    if (viewName === 'dashboard') this.refreshDashboard();
    else if (viewName === 'products') window.ProductsModule.loadProducts();
    else if (viewName === 'categories') window.CategoriesModule.loadCategories();
    else if (viewName === 'suppliers') window.SuppliersModule.loadSuppliers();
    else if (viewName === 'customers') window.CustomersModule.loadCustomers();
    else if (viewName === 'orders') window.OrdersModule.loadOrders();
    else if (viewName === 'inventory') this.renderInventoryView();
    else if (viewName === 'expiry') this.renderExpiryView();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  async refreshAll() {
    await Promise.all([
      this.refreshDashboard(),
      window.ProductsModule.loadProducts(),
      window.CategoriesModule.loadCategories(),
      window.SuppliersModule.loadSuppliers(),
      window.CustomersModule.loadCustomers(),
      window.OrdersModule.loadOrders()
    ]);
  },

  async refreshDashboard() {
    try {
      const res = await window.MedicareAPI.getDashboard();
      if (!res.success) return;
      const { metrics, recent_orders, low_stock_products } = res.data;

      // Update Metric Values
      const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
      };

      setVal('stat-total-products', metrics.total_products);
      setVal('stat-total-categories', metrics.total_categories);
      setVal('stat-total-suppliers', metrics.total_suppliers);
      setVal('stat-total-customers', metrics.total_customers);
      setVal('stat-total-orders', metrics.total_orders);
      setVal('stat-pending-orders', metrics.pending_orders);
      setVal('stat-completed-orders', metrics.completed_orders);
      setVal('stat-low-stock', metrics.low_stock_products);
      setVal('stat-today-sales', '₹' + metrics.today_sales.toFixed(2));
      setVal('stat-inventory-value', '₹' + metrics.total_inventory_value.toFixed(2));

      // Restock Alert Banner
      const banner = document.getElementById('dashboard-low-stock-alert');
      const bannerCount = document.getElementById('dashboard-low-stock-count');
      if (banner && bannerCount) {
        if (metrics.low_stock_products > 0) {
          banner.classList.remove('d-none');
          bannerCount.textContent = `${metrics.low_stock_products} products require restocking`;
        } else {
          banner.classList.add('d-none');
        }
      }

      // Render Recent Orders Table
      const recentOrdersTbody = document.getElementById('dashboard-recent-orders-tbody');
      if (recentOrdersTbody) {
        if (recent_orders.length === 0) {
          recentOrdersTbody.innerHTML = `<tr><td colspan="6" class="text-center py-3 text-muted">No orders recorded yet.</td></tr>`;
        } else {
          recentOrdersTbody.innerHTML = recent_orders.map(o => `
            <tr>
              <td class="font-mono-code fw-semibold text-primary">#ORD-${String(o.id).padStart(4, '0')}</td>
              <td class="fw-semibold text-dark">${this.escapeHtml(o.customer_name)}</td>
              <td><span class="small font-mono-code text-muted">${o.order_date}</span></td>
              <td class="tabular-nums text-end fw-bold">₹${parseFloat(o.total_amount).toFixed(2)}</td>
              <td><span class="status-indicator status-pill-${(o.order_status || '').toLowerCase()}">${o.order_status}</span></td>
              <td>
                <button class="btn btn-sm btn-outline-secondary btn-action-icon" title="View Order" onclick="OrdersModule.openOrderDetails(${o.id})">
                  <i class="bi bi-eye"></i>
                </button>
              </td>
            </tr>
          `).join('');
        }
      }

      // Render Low Stock Products Table
      const lowStockTbody = document.getElementById('dashboard-low-stock-tbody');
      if (lowStockTbody) {
        if (low_stock_products.length === 0) {
          lowStockTbody.innerHTML = `<tr><td colspan="6" class="text-center py-3 text-success"><i class="bi bi-check-circle me-1"></i> All products are comfortably stocked!</td></tr>`;
        } else {
          lowStockTbody.innerHTML = low_stock_products.map(p => `
            <tr>
              <td>
                <div class="fw-semibold text-dark">${this.escapeHtml(p.product_name)}</div>
                <div class="small font-mono-code text-muted">${this.escapeHtml(p.product_code)} · ${this.escapeHtml(p.brand)}</div>
              </td>
              <td><span class="text-secondary small">${this.escapeHtml(p.category_name || 'N/A')}</span></td>
              <td class="tabular-nums text-center fw-bold ${p.stock_quantity == 0 ? 'text-danger' : 'text-warning'}">${p.stock_quantity} ${this.escapeHtml(p.unit || '')}</td>
              <td class="tabular-nums text-center text-muted">${p.reorder_level}</td>
              <td>
                <span class="status-indicator ${p.stock_quantity == 0 ? 'status-out-stock' : 'status-low-stock'}">
                  ${p.stock_quantity == 0 ? 'Out of Stock' : 'Low Stock'}
                </span>
              </td>
              <td>
                <button class="btn btn-sm btn-outline-primary btn-action-icon" title="Edit / Restock" onclick="ProductsModule.openEditModal(${p.id})">
                  <i class="bi bi-plus-lg"></i>
                </button>
              </td>
            </tr>
          `).join('');
        }
      }

    } catch (err) {
      console.error('Error refreshing dashboard:', err);
    }
  },

  async renderInventoryView() {
    const tbody = document.getElementById('inventory-table-body');
    if (!tbody) return;

    const res = await window.MedicareAPI.getProducts();
    if (!res.success) return;
    const prods = res.data;

    let inStockCount = 0;
    let lowStockCount = 0;
    let outStockCount = 0;

    prods.forEach(p => {
      if (p.stock_quantity === 0) outStockCount++;
      else if (p.stock_quantity <= p.reorder_level) lowStockCount++;
      else inStockCount++;
    });

    const badgeIn = document.getElementById('inv-badge-in-stock');
    const badgeLow = document.getElementById('inv-badge-low-stock');
    const badgeOut = document.getElementById('inv-badge-out-stock');
    if (badgeIn) badgeIn.textContent = `${inStockCount} In Stock`;
    if (badgeLow) badgeLow.textContent = `${lowStockCount} Low Stock`;
    if (badgeOut) badgeOut.textContent = `${outStockCount} Out of Stock`;

    tbody.innerHTML = prods.map(p => {
      let statusBadge = '';
      if (p.stock_quantity === 0) {
        statusBadge = '<span class="status-indicator status-out-stock"><i class="bi bi-x-circle"></i> Out of Stock</span>';
      } else if (p.stock_quantity <= p.reorder_level) {
        statusBadge = '<span class="status-indicator status-low-stock"><i class="bi bi-exclamation-triangle"></i> Low Stock</span>';
      } else {
        statusBadge = '<span class="status-indicator status-in-stock"><i class="bi bi-check2-circle"></i> In Stock</span>';
      }

      return `
        <tr>
          <td>
            <div class="fw-semibold text-dark">${this.escapeHtml(p.product_name)}</div>
            <div class="small text-muted font-mono-code">${this.escapeHtml(p.product_code)} · ${this.escapeHtml(p.brand)}</div>
          </td>
          <td><span class="font-mono-code">${this.escapeHtml(p.batch_number)}</span></td>
          <td><span class="badge bg-light text-secondary border">${this.escapeHtml(p.rack_number || 'A-1')}</span></td>
          <td class="tabular-nums text-center">
            <span class="fw-bold ${p.stock_quantity <= p.reorder_level ? 'text-danger' : 'text-dark'}">${p.stock_quantity}</span>
            <span class="small text-muted"> ${this.escapeHtml(p.unit || '')}</span>
          </td>
          <td class="tabular-nums text-center text-muted">${p.reorder_level}</td>
          <td><span class="font-mono-code small text-secondary">${p.expiry_date}</span></td>
          <td>${statusBadge}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary" onclick="ProductsModule.openEditModal(${p.id})">
              <i class="bi bi-arrow-repeat me-1"></i> Restock
            </button>
          </td>
        </tr>`;
    }).join('');
  },

  async renderExpiryView() {
    const tbody = document.getElementById('expiry-table-body');
    if (!tbody) return;

    const res = await window.MedicareAPI.getProducts();
    if (!res.success) return;
    const prods = res.data;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const items = prods.map(p => {
      const exp = new Date(p.expiry_date);
      const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
      let status = 'Safe';
      let badgeClass = 'status-safe';

      if (diffDays < 0) {
        status = 'Expired';
        badgeClass = 'status-expired';
      } else if (diffDays <= 30) {
        status = 'Expiring Soon';
        badgeClass = 'status-expiring';
      }

      return {
        ...p,
        diffDays,
        status,
        badgeClass
      };
    });

    // Sort: Expired first, then expiring soon, then safe
    items.sort((a, b) => a.diffDays - b.diffDays);

    const safeCount = items.filter(i => i.status === 'Safe').length;
    const soonCount = items.filter(i => i.status === 'Expiring Soon').length;
    const expCount = items.filter(i => i.status === 'Expired').length;

    const bSafe = document.getElementById('exp-badge-safe');
    const bSoon = document.getElementById('exp-badge-soon');
    const bExp = document.getElementById('exp-badge-expired');
    if (bSafe) bSafe.textContent = `${safeCount} Safe`;
    if (bSoon) bSoon.textContent = `${soonCount} Expiring Soon (<30d)`;
    if (bExp) bExp.textContent = `${expCount} Expired`;

    tbody.innerHTML = items.map(p => `
      <tr>
        <td>
          <div class="fw-semibold text-dark">${this.escapeHtml(p.product_name)}</div>
          <div class="small text-muted font-mono-code">${this.escapeHtml(p.product_code)} · ${this.escapeHtml(p.brand)}</div>
        </td>
        <td><span class="font-mono-code">${this.escapeHtml(p.batch_number)}</span></td>
        <td><span class="font-mono-code fw-semibold ${p.diffDays < 0 ? 'text-danger' : 'text-dark'}">${p.expiry_date}</span></td>
        <td class="tabular-nums text-center">${p.stock_quantity} ${this.escapeHtml(p.unit || '')}</td>
        <td class="tabular-nums text-center">
          <span class="fw-semibold ${p.diffDays < 0 ? 'text-danger' : (p.diffDays <= 30 ? 'text-warning' : 'text-success')}">
            ${p.diffDays < 0 ? `${Math.abs(p.diffDays)} days ago` : `${p.diffDays} days`}
          </span>
        </td>
        <td><span class="status-indicator ${p.badgeClass}">${p.status}</span></td>
        <td>
          ${p.status === 'Expired'
            ? `<span class="badge bg-danger-subtle text-danger border border-danger-subtle"><i class="bi bi-lock-fill"></i> Locked for Orders</span>`
            : `<button class="btn btn-sm btn-outline-secondary" onclick="ProductsModule.openViewModal(${p.id})"><i class="bi bi-eye"></i> Details</button>`
          }
        </td>
      </tr>
    `).join('');
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center text-white bg-${type === 'danger' ? 'danger' : (type === 'success' ? 'success' : (type === 'warning' ? 'warning text-dark' : 'dark'))} border-0 shadow`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');

    toastEl.innerHTML = `
      <div class="d-flex">
        <div class="toast-body py-2 px-3 fw-medium">
          ${this.escapeHtml(message)}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;

    container.appendChild(toastEl);
    const bsToast = new bootstrap.Toast(toastEl, { delay: 3500 });
    bsToast.show();

    toastEl.addEventListener('hidden.bs.toast', () => {
      toastEl.remove();
    });
  },

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};

window.MedicareApp = MedicareApp;

// Launch on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  MedicareApp.init();
});

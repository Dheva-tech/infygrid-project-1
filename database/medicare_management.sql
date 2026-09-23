-- ==========================================================
-- MediCare Medical Store Management System
-- Database: medicare_management
-- Description: Full relational database schema for OTC pharmacy inventory,
--              suppliers, categories, customers, and order management.
-- Compatible with: MySQL 5.7+, MySQL 8.0+, MariaDB 10.3+, phpMyAdmin
-- ==========================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP DATABASE IF EXISTS `medicare_management`;
CREATE DATABASE IF NOT EXISTS `medicare_management` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `medicare_management`;
SET FOREIGN_KEY_CHECKS = 1;

-- --------------------------------------------------------
-- Table structure for table `users`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'pharmacist', 'store_manager') NOT NULL DEFAULT 'pharmacist',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_user_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `categories`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_category_name` (`category_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `suppliers`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `suppliers`;
CREATE TABLE `suppliers` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `supplier_name` VARCHAR(120) NOT NULL,
  `company_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(25) NOT NULL,
  `gst_number` VARCHAR(30) NULL,
  `address` TEXT NOT NULL,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_supplier_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `products`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_code` VARCHAR(50) NOT NULL,
  `product_name` VARCHAR(150) NOT NULL,
  `category_id` INT UNSIGNED NOT NULL,
  `supplier_id` INT UNSIGNED NOT NULL,
  `brand` VARCHAR(100) NOT NULL,
  `batch_number` VARCHAR(60) NOT NULL,
  `manufacturing_date` DATE NOT NULL,
  `expiry_date` DATE NOT NULL,
  `purchase_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `selling_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `stock_quantity` INT NOT NULL DEFAULT 0,
  `reorder_level` INT NOT NULL DEFAULT 10,
  `unit` VARCHAR(50) NOT NULL DEFAULT 'Strip / Pack',
  `rack_number` VARCHAR(30) NULL DEFAULT 'Rack A-1',
  `description` TEXT NULL,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_product_code` (`product_code`),
  KEY `idx_product_category` (`category_id`),
  KEY `idx_product_supplier` (`supplier_id`),
  KEY `idx_product_expiry` (`expiry_date`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_products_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `customers`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `customer_name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(25) NOT NULL,
  `date_of_birth` DATE NULL,
  `address` TEXT NOT NULL,
  `city` VARCHAR(80) NOT NULL,
  `state` VARCHAR(80) NOT NULL,
  `pincode` VARCHAR(20) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_customer_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `orders`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `customer_id` INT UNSIGNED NOT NULL,
  `order_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `total_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `payment_method` ENUM('Cash', 'UPI', 'Card') NOT NULL DEFAULT 'Cash',
  `order_status` ENUM('Pending', 'Confirmed', 'Processing', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Pending',
  `delivery_address` TEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_customer` (`customer_id`),
  KEY `idx_order_date` (`order_date`),
  CONSTRAINT `fk_orders_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `order_items`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` INT UNSIGNED NOT NULL,
  `product_id` INT UNSIGNED NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `unit_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `subtotal` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`),
  KEY `idx_item_order` (`order_id`),
  KEY `idx_item_product` (`product_id`),
  CONSTRAINT `fk_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- SEED DATA INSERTION
-- ==========================================================

-- 1. Insert Users (Admin default password: password123 hashed via password_hash)
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `created_at`) VALUES
(1, 'Dr. Sarah Mitchell', 'admin@medicare.local', '$2y$10$e8wVfT0Z87mK3mGfXgWlU.jH7u9yR9.E0n3k0jF4C5V6B7N8M9O0P', 'admin', NOW()),
(2, 'Robert Sterling', 'pharmacist@medicare.local', '$2y$10$e8wVfT0Z87mK3mGfXgWlU.jH7u9yR9.E0n3k0jF4C5V6B7N8M9O0P', 'pharmacist', NOW());

-- 2. Insert 7 Requested OTC Categories
INSERT INTO `categories` (`id`, `category_name`, `description`, `status`) VALUES
(1, 'Pain Relief', 'Over-the-counter analgesic balms, sprays, and anti-inflammatory ointments', 'active'),
(2, 'Vitamins & Supplements', 'Daily nutritional multivitamins, calcium tablets, and herbal immunity boosters', 'active'),
(3, 'First Aid', 'Sterile wound dressings, medical tape, antiseptic liquids, and emergency burn care', 'active'),
(4, 'Health Devices', 'Diagnostic instruments including digital blood pressure monitors, pulse oximeters, and clinical thermometers', 'active'),
(5, 'Personal Care', 'Medicated skin lotions, antibacterial sanitizers, oral hygiene rinses, and sun protection', 'active'),
(6, 'Baby Care', 'Pediatric gentle wipes, soothing diaper rash creams, baby gripe water, and hypoallergenic powders', 'active'),
(7, 'Elder Care', 'Adult incontinence briefs, joint support heat belts, mobility grips, and anti-slip walking aids', 'active');

-- 3. Insert 10 Realistic Suppliers
INSERT INTO `suppliers` (`id`, `supplier_name`, `company_name`, `email`, `phone`, `gst_number`, `address`, `status`) VALUES
(1, 'Rajesh Mehta', 'Apex Healthcare Distributors', 'orders@apexhealth.com', '+91 98201 44521', '27AAACA9921D1ZK', 'Plot 42, Andheri Pharma Zone, Mumbai, MH', 'active'),
(2, 'Anita Deshmukh', 'Beacon Medical Supplies Ltd', 'sales@beaconmed.in', '+91 98402 33190', '33AABCB1293P1ZM', '88 Anna Salai Industrial Estate, Chennai, TN', 'active'),
(3, 'Vikram Sharma', 'CureWell Diagnostics Hub', 'supply@curewelldiag.com', '+91 98110 55412', '07AACCC4421M1ZN', 'B-14 Okhla Industrial Phase II, New Delhi, DL', 'active'),
(4, 'Siddharth Rao', 'Delta Pharma Logistics', 'contact@deltapharma.org', '+91 97401 22845', '29AACCD8812K1ZO', '7th Cross Peenya Industrial Area, Bengaluru, KA', 'active'),
(5, 'Pooja Kulkarni', 'EverGreen Herbal & Wellness', 'wholesale@evergreenherb.in', '+91 98901 77234', '27AACCE3391J1ZP', 'Shivaji Nagar Midc Road, Pune, MH', 'active'),
(6, 'Manish Verma', 'Firstline Surgical Corp', 'orders@firstlinesurg.com', '+91 94150 66890', '09AACCF5519L1ZQ', 'Industrial Area Sector 5, Lucknow, UP', 'active'),
(7, 'Sunil Patel', 'Global MedTech Instruments', 'info@globalmedtech.co', '+91 98250 88129', '24AACCG7741F1ZR', 'GIDC Electronics Zone, Gandhinagar, GJ', 'active'),
(8, 'Kavita Menon', 'Horizon Pediatric & Baby Care', 'sales@horizonbaby.in', '+91 94470 11923', '32AACCH9982Q1ZS', 'Kaloor Health Hub, Kochi, KL', 'active'),
(9, 'Deepak Banerjee', 'Imperial ElderCare Products', 'supply@imperialelder.com', '+91 98300 44781', '19AACCI6610H1ZT', 'Sector V Salt Lake, Kolkata, WB', 'active'),
(10, 'Neha Chopra', 'Zenith Sanitisers & Hygiene', 'dispatch@zenithhygiene.com', '+91 98720 99312', '03AACCJ2291E1ZU', 'Phase 8 Industrial Focal Point, Mohali, PB', 'active');

-- 4. Insert 32+ Realistic OTC Products (varied stock levels & varied expiry dates)
INSERT INTO `products` (`id`, `product_code`, `product_name`, `category_id`, `supplier_id`, `brand`, `batch_number`, `manufacturing_date`, `expiry_date`, `purchase_price`, `selling_price`, `stock_quantity`, `reorder_level`, `unit`, `rack_number`, `description`, `status`) VALUES
-- Category 1: Pain Relief
(1, 'MED-PR-001', 'Diclofenac Fast Relief Gel 30g', 1, 1, 'VoltaGel', 'BCH-2025-01', '2025-01-10', '2027-01-10', 65.00, 95.00, 52, 15, 'Tube', 'Rack A-1', 'Topical analgesic soothing gel for backache, joint stiffness, and muscular sprains.', 'active'),
(2, 'MED-PR-002', 'Ibuprofen & Paracetamol Pain Balm 20g', 1, 1, 'TigerCare', 'BCH-2024-11', '2024-11-01', '2026-11-01', 42.00, 68.00, 38, 12, 'Jar', 'Rack A-1', 'Herbal infused fast-acting balm for tension headaches and neck discomfort.', 'active'),
(3, 'MED-PR-003', 'Menthol Cooling Pain Spray 55g', 1, 2, 'ReliefSprint', 'BCH-2025-03', '2025-03-05', '2027-03-05', 120.00, 165.00, 6, 15, 'Aerosol Can', 'Rack A-2', 'Targeted cold therapy micro-spray for acute sports injuries and ligament strain.', 'active'),
(4, 'MED-PR-004', 'Capsaicin Deep Heat Patch (Pack of 5)', 1, 2, 'ThermaRelief', 'BCH-2023-08', '2023-08-15', '2025-08-15', 140.00, 199.00, 8, 10, 'Box (5 Patches)', 'Rack A-2', 'Long-lasting self-adhesive continuous warmth patch for chronic lower back tension.', 'active'),
(5, 'MED-PR-005', 'Ayurvedic Herbal Joint Massage Oil 100ml', 1, 5, 'VedaComfort', 'BCH-2024-06', '2024-06-20', '2026-06-20', 110.00, 175.00, 0, 10, 'Bottle', 'Rack A-3', 'Traditional formulation enriched with wintergreen oil, eucalyptus, and camphor for joint ease.', 'active'),

-- Category 2: Vitamins & Supplements
(6, 'MED-VS-001', 'Daily Multivitamin & Minerals (60 Tabs)', 2, 4, 'NutriDaily', 'BCH-2025-02', '2025-02-14', '2027-02-14', 210.00, 320.00, 64, 20, 'Bottle (60 Tablets)', 'Rack B-1', 'Comprehensive micronutrient supplement with Vitamin C, D3, Zinc, and Selenium.', 'active'),
(7, 'MED-VS-002', 'Calcium Citrate + Vitamin D3 (30 Tabs)', 2, 4, 'CalciStrong', 'BCH-2025-01', '2025-01-20', '2026-10-15', 135.00, 210.00, 14, 15, 'Strip', 'Rack B-1', 'Bio-absorbable calcium citrate malate formula supporting bone mineral density.', 'active'),
(8, 'MED-VS-003', 'Omega-3 Deep Sea Fish Oil 1000mg (60 Softgels)', 2, 4, 'OceanPure', 'BCH-2025-04', '2025-04-01', '2027-04-01', 380.00, 549.00, 25, 10, 'Bottle', 'Rack B-2', 'Molecularly distilled EPA & DHA essential fatty acids for cardiovascular and ocular health.', 'active'),
(9, 'MED-VS-004', 'Effervescent Vitamin C 1000mg + Zinc (20 Fizz Tabs)', 2, 5, 'ImmunoBoost', 'BCH-2024-12', '2024-12-10', '2026-12-10', 180.00, 260.00, 4, 15, 'Tube (20 Tabs)', 'Rack B-2', 'Orange-flavored effervescent immune defense beverage tablets.', 'active'),
(10, 'MED-VS-005', 'Plant-Based Iron & Folic Acid Complex (30 Caps)', 2, 5, 'FloraHeme', 'BCH-2023-09', '2023-09-01', '2025-09-01', 150.00, 230.00, 0, 8, 'Blister Pack', 'Rack B-3', 'Gentle non-constipating plant-derived iron capsules with active vitamin B12.', 'active'),

-- Category 3: First Aid
(11, 'MED-FA-001', 'Sterile Adhesive Waterproof Bandages (Pack of 50)', 3, 6, 'FirstGuard', 'BCH-2025-01', '2025-01-05', '2030-01-05', 55.00, 89.00, 110, 25, 'Box (50 Strips)', 'Rack C-1', 'Hypoallergenic flexible waterproof bandages with non-stick absorbent pad.', 'active'),
(12, 'MED-FA-002', 'Povidone Iodine Antiseptic Solution 100ml', 3, 6, 'MicroCure', 'BCH-2025-02', '2025-02-18', '2027-02-18', 62.00, 95.00, 48, 15, 'Bottle', 'Rack C-1', 'Broad-spectrum antimicrobial topical germicide for minor cuts, grazes, and abrasions.', 'active'),
(13, 'MED-FA-003', 'Antiseptic Disinfectant Liquid 250ml', 3, 10, 'SaniCare', 'BCH-2024-10', '2024-10-15', '2026-10-15', 78.00, 115.00, 9, 20, 'Bottle', 'Rack C-2', 'Concentrated chloroxylenol disinfectant liquid for first aid wound hygiene and laundry.', 'active'),
(14, 'MED-FA-004', 'Elastic Crepe Bandage 10cm x 4m', 3, 6, 'OrthoWrap', 'BCH-2025-03', '2025-03-01', '2030-03-01', 85.00, 135.00, 32, 10, 'Roll', 'Rack C-2', 'Heavy cotton high-stretch compression bandage with fastening clips for joint support.', 'active'),
(15, 'MED-FA-005', 'Emergency Burn Relief Hydrogel 50g', 3, 2, 'BurnShield', 'BCH-2024-05', '2024-05-10', '2026-05-10', 95.00, 145.00, 2, 10, 'Tube', 'Rack C-3', 'Medical-grade cooling hydrogel formula containing tea tree essence for thermal scalds.', 'active'),

-- Category 4: Health Devices
(16, 'MED-HD-001', 'Digital Upper Arm Blood Pressure Monitor', 4, 3, 'OmroTech', 'BCH-2025-01', '2025-01-01', '2030-01-01', 1150.00, 1699.00, 18, 5, 'Device Unit', 'Rack D-1', 'Fully automatic oscillometric BP measurement with irregular heartbeat detector and memory.', 'active'),
(17, 'MED-HD-002', 'Fingertip LED Pulse Oximeter', 4, 3, 'OxyCheck', 'BCH-2025-02', '2025-02-05', '2030-02-05', 450.00, 699.00, 22, 8, 'Device Unit', 'Rack D-1', 'Non-invasive SpO2 oxygen saturation level and PR pulse rate real-time monitor.', 'active'),
(18, 'MED-HD-003', 'Instant Clinical Infrared Forehead Thermometer', 4, 7, 'ThermoScan', 'BCH-2025-03', '2025-03-12', '2030-03-12', 650.00, 999.00, 15, 6, 'Device Unit', 'Rack D-2', '1-second contactless high-precision body and surface temperature scanner.', 'active'),
(19, 'MED-HD-004', 'Blood Glucose Monitoring Starter Kit (with 25 Strips)', 4, 7, 'GlucoTrue', 'BCH-2024-11', '2024-11-20', '2026-11-20', 720.00, 1099.00, 5, 8, 'Kit Box', 'Rack D-2', 'Electrochemical biosensor glucometer kit with lancing device, 25 sterile lancets, and test strips.', 'active'),
(20, 'MED-HD-005', 'Portable Ultrasonic Mesh Nebulizer', 4, 7, 'BreatheEasy', 'BCH-2025-01', '2025-01-15', '2030-01-15', 920.00, 1399.00, 7, 5, 'Unit', 'Rack D-3', 'Silent handheld battery-operated respiratory mist inhaler for children and adults.', 'active'),

-- Category 5: Personal Care
(21, 'MED-PC-001', 'Broad Spectrum Sunscreen Gel SPF 50 PA++++ 50g', 5, 1, 'DermaShield', 'BCH-2025-02', '2025-02-10', '2027-02-10', 260.00, 399.00, 35, 10, 'Tube', 'Rack E-1', 'Non-comedogenic, matte finish mineral sun protectant against UVA, UVB, and blue light.', 'active'),
(22, 'MED-PC-002', 'Moisturizing Ceramide Barrier Lotion 200ml', 5, 1, 'HydraDerm', 'BCH-2025-03', '2025-03-01', '2027-03-01', 290.00, 449.00, 28, 10, 'Pump Bottle', 'Rack E-1', 'Fragrance-free therapeutic moisturizer with 3 essential ceramides and hyaluronic acid.', 'active'),
(23, 'MED-PC-003', 'Antibacterial Instant Hand Sanitizer Gel 500ml', 5, 10, 'PureGuard', 'BCH-2024-09', '2024-09-12', '2026-09-12', 95.00, 149.00, 4, 15, 'Pump Bottle', 'Rack E-2', '75% medical isopropyl alcohol hand sanitizer formulated with soothing aloe vera extract.', 'active'),
(24, 'MED-PC-004', 'Chlorhexidine Antiseptic Mouthwash 200ml', 5, 2, 'OralCure', 'BCH-2025-01', '2025-01-25', '2026-12-25', 85.00, 130.00, 18, 8, 'Bottle', 'Rack E-2', 'Alcohol-free dental germicidal rinse for plaque control and gingival soothing.', 'active'),

-- Category 6: Baby Care
(25, 'MED-BC-001', 'Zinc Oxide Soothing Diaper Rash Cream 75g', 6, 8, 'BabySoft', 'BCH-2025-01', '2025-01-14', '2027-01-14', 110.00, 169.00, 42, 12, 'Tube', 'Rack F-1', 'Gentle barrier cream fortified with 15% micro-fine zinc oxide and organic calendula.', 'active'),
(26, 'MED-BC-002', 'Hypoallergenic 99% Pure Water Baby Wipes (72 Wipes)', 6, 8, 'AquaBaby', 'BCH-2025-02', '2025-02-01', '2027-02-01', 90.00, 135.00, 50, 15, 'Pouch (72 Wipes)', 'Rack F-1', 'Biodegradable non-woven fabric wipes infused with organic chamomile, zero fragrance.', 'active'),
(27, 'MED-BC-003', 'Ayurvedic Gripe Water Colic Relief 150ml', 6, 8, 'TinyTummy', 'BCH-2024-11', '2024-11-05', '2026-11-05', 48.00, 75.00, 7, 10, 'Glass Bottle', 'Rack F-2', 'Alcohol-free dill and fennel extract syrup for infants stomach gas and teething distress.', 'active'),
(28, 'MED-BC-004', 'Pediatric Electrolyte Oral Hydration Solution 200ml', 6, 8, 'PedioLyte', 'BCH-2025-03', '2025-03-10', '2026-09-10', 32.00, 49.00, 3, 15, 'Tetrapack', 'Rack F-2', 'WHO-compliant ready-to-drink oral rehydration solution in refreshing apple flavor.', 'active'),

-- Category 7: Elder Care
(29, 'MED-EC-001', 'Adult Incontinence Tape Diapers Large (Pack of 10)', 7, 9, 'SeniorDignity', 'BCH-2025-01', '2025-01-18', '2028-01-18', 340.00, 499.00, 36, 10, 'Pack (10 Diapers)', 'Rack G-1', 'Super absorbent polymer dual-core briefs with wetness indicator and leak barriers.', 'active'),
(30, 'MED-EC-002', 'Orthopedic Lumbo Sacral Back Support Belt (Size L)', 7, 9, 'SpineCare', 'BCH-2025-02', '2025-02-22', '2030-02-22', 420.00, 649.00, 16, 6, 'Box', 'Rack G-1', 'Double pull breathable elastic abdominal binder with malleable aluminum splints.', 'active'),
(31, 'MED-EC-003', 'Adjustable Quad-Base Anti-Slip Walking Cane', 7, 9, 'WalkMaster', 'BCH-2025-03', '2025-03-01', '2030-03-01', 380.00, 580.00, 8, 5, 'Unit', 'Rack G-2', 'Lightweight anodized aluminum cane with cushioned ergonomic handle and 4-point rubber feet.', 'active'),
(32, 'MED-EC-004', 'Electric Heating Pad for Joint & Muscle Stiffness', 7, 9, 'ComfortTherapy', 'BCH-2024-12', '2024-12-05', '2029-12-05', 490.00, 750.00, 11, 4, 'Unit Box', 'Rack G-2', 'Washable ultra-soft fleece orthopedic heating pad with 3 thermostatically controlled levels.', 'active');

-- 5. Insert 20 Realistic Customers
INSERT INTO `customers` (`id`, `customer_name`, `email`, `phone`, `date_of_birth`, `address`, `city`, `state`, `pincode`) VALUES
(1, 'Aarav Patel', 'aarav.patel@gmail.com', '+91 98200 12345', '1988-04-12', 'Flat 402, Sunshine Heights, Juhu', 'Mumbai', 'Maharashtra', '400049'),
(2, 'Priya Sharma', 'priya.sharma@yahoo.com', '+91 98111 23456', '1992-09-25', 'B-12 Greenwood Apartments, Indirapuram', 'Ghaziabad', 'Uttar Pradesh', '201014'),
(3, 'Rohan Verma', 'rohan.verma@outlook.com', '+91 97410 34567', '1985-11-18', '74, 5th Main Road, Indiranagar', 'Bengaluru', 'Karnataka', '560038'),
(4, 'Sneha Mukherjee', 'sneha.m@rediffmail.com', '+91 98301 45678', '1990-07-03', '21B Lake View Road, Ballygunge', 'Kolkata', 'West Bengal', '700029'),
(5, 'Vikramaditya Rao', 'vikram.rao@gmail.com', '+91 98490 56789', '1979-02-14', 'Plot 88, Jubilee Hills Road No 36', 'Hyderabad', 'Telangana', '500033'),
(6, 'Ananya Sundaram', 'ananya.sundaram@gmail.com', '+91 98401 67890', '1995-12-30', '14 Besant Avenue, Adyar', 'Chennai', 'Tamil Nadu', '600020'),
(7, 'Kabir Mehta', 'kabir.mehta@gmail.com', '+91 98251 78901', '1983-06-22', '12 Prernatirth Derasar Road, Satellite', 'Ahmedabad', 'Gujarat', '380015'),
(8, 'Divya Nair', 'divya.nair@hotmail.com', '+91 94471 89012', '1991-08-19', 'Palm Grove Villa 5, Panampilly Nagar', 'Kochi', 'Kerala', '682036'),
(9, 'Arjun Singh', 'arjun.singh@gmail.com', '+91 98140 90123', '1987-03-08', 'House 142 Sector 11-A', 'Chandigarh', 'Punjab', '160011'),
(10, 'Meera Kulkarni', 'meera.kulkarni@gmail.com', '+91 98902 01234', '1993-10-11', '89 Mayur Colony, Kothrud', 'Pune', 'Maharashtra', '411038'),
(11, 'Gaurav Joshi', 'gaurav.joshi@gmail.com', '+91 94140 12345', '1986-05-17', 'C-48 Malviya Nagar', 'Jaipur', 'Rajasthan', '302017'),
(12, 'Tanvi Saxena', 'tanvi.saxena@gmail.com', '+91 94151 23456', '1994-01-28', '24 Gomti Nagar Extension', 'Lucknow', 'Uttar Pradesh', '226010'),
(13, 'Siddharth Iyer', 'sid.iyer@gmail.com', '+91 98203 34567', '1982-11-04', '601 Oberoi Exquisite, Goregaon East', 'Mumbai', 'Maharashtra', '400063'),
(14, 'Ishita Roy', 'ishita.roy@gmail.com', '+91 98312 45678', '1996-03-15', 'Block C New Town Action Area 1', 'Kolkata', 'West Bengal', '700156'),
(15, 'Rajeev Nambiar', 'rajeev.n@gmail.com', '+91 94462 56789', '1975-09-09', 'Chithra Lane, Kowdiar', 'Thiruvananthapuram', 'Kerala', '695003'),
(16, 'Kritika Sen', 'kritika.sen@gmail.com', '+91 98103 67890', '1997-07-21', 'A-304 DLF Phase 5', 'Gurugram', 'Haryana', '122009'),
(17, 'Naveen Reddy', 'naveen.reddy@gmail.com', '+91 98481 78901', '1989-12-05', 'H.No 3-6-412 Himayatnagar', 'Hyderabad', 'Telangana', '500029'),
(18, 'Bhavna Dave', 'bhavna.dave@gmail.com', '+91 98242 89012', '1981-04-30', '7 Race Course Road', 'Vadodara', 'Gujarat', '390007'),
(19, 'Alok Gupta', 'alok.gupta@gmail.com', '+91 94250 90123', '1984-08-14', '18 South Tukoganj', 'Indore', 'Madhya Pradesh', '452001'),
(20, 'Shalini Menon', 'shalini.menon@gmail.com', '+91 97422 01234', '1990-06-25', 'Villa 12, Koramangala 4th Block', 'Bengaluru', 'Karnataka', '560034');

-- 6. Insert 12 Realistic Orders
INSERT INTO `orders` (`id`, `customer_id`, `order_date`, `total_amount`, `payment_method`, `order_status`, `delivery_address`, `created_at`) VALUES
(1, 1, '2026-03-20 10:15:00', 415.00, 'UPI', 'Completed', 'Flat 402, Sunshine Heights, Juhu, Mumbai', '2026-03-20 10:15:00'),
(2, 3, '2026-03-20 14:30:00', 2019.00, 'Card', 'Completed', '74, 5th Main Road, Indiranagar, Bengaluru', '2026-03-20 14:30:00'),
(3, 2, '2026-03-21 09:45:00', 584.00, 'Cash', 'Completed', 'B-12 Greenwood Apartments, Indirapuram, Ghaziabad', '2026-03-21 09:45:00'),
(4, 5, '2026-03-21 16:20:00', 1698.00, 'UPI', 'Processing', 'Plot 88, Jubilee Hills Road No 36, Hyderabad', '2026-03-21 16:20:00'),
(5, 6, '2026-03-22 11:10:00', 439.00, 'Card', 'Confirmed', '14 Besant Avenue, Adyar, Chennai', '2026-03-22 11:10:00'),
(6, 4, '2026-03-22 15:40:00', 1099.00, 'UPI', 'Pending', '21B Lake View Road, Ballygunge, Kolkata', '2026-03-22 15:40:00'),
(7, 8, '2026-03-22 18:05:00', 379.00, 'Cash', 'Pending', 'Palm Grove Villa 5, Panampilly Nagar, Kochi', '2026-03-22 18:05:00'),
(8, 10, '2026-03-23 08:30:00', 1229.00, 'UPI', 'Processing', '89 Mayur Colony, Kothrud, Pune', '2026-03-23 08:30:00'),
(9, 7, '2026-03-23 09:15:00', 699.00, 'Card', 'Confirmed', '12 Prernatirth Derasar Road, Satellite, Ahmedabad', '2026-03-23 09:15:00'),
(10, 12, '2026-03-23 10:00:00', 548.00, 'Cash', 'Pending', '24 Gomti Nagar Extension, Lucknow', '2026-03-23 10:00:00'),
(11, 13, '2026-03-23 11:25:00', 1748.00, 'UPI', 'Processing', '601 Oberoi Exquisite, Goregaon East, Mumbai', '2026-03-23 11:25:00'),
(12, 16, '2026-03-23 11:50:00', 304.00, 'Card', 'Confirmed', 'A-304 DLF Phase 5, Gurugram', '2026-03-23 11:50:00');

-- 7. Insert Order Items
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `unit_price`, `subtotal`) VALUES
-- Order 1: Aarav Patel (Diclofenac Gel x 1 + Multivitamin x 1)
(1, 1, 1, 1, 95.00, 95.00),
(2, 1, 6, 1, 320.00, 320.00),

-- Order 2: Rohan Verma (OmroTech BP Monitor x 1 + Daily Multivitamin x 1)
(3, 2, 16, 1, 1699.00, 1699.00),
(4, 2, 6, 1, 320.00, 320.00),

-- Order 3: Priya Sharma (Bandages x 2 + Povidone Iodine x 1 + Ceramide Lotion x 1)
(5, 3, 11, 2, 89.00, 178.00),
(6, 3, 12, 1, 95.00, 95.00),
(7, 3, 22, 1, 311.00, 311.00),

-- Order 4: Vikramaditya Rao (Adult Diapers x 2 + Walking Cane x 1 + Pain Gel x 1)
(8, 4, 29, 2, 499.00, 998.00),
(9, 4, 31, 1, 580.00, 580.00),
(10, 4, 1, 1, 120.00, 120.00),

-- Order 5: Ananya Sundaram (Diaper Rash Cream x 2 + Pure Water Wipes x 1)
(11, 5, 25, 2, 169.00, 338.00),
(12, 5, 26, 1, 101.00, 101.00),

-- Order 6: Sneha Mukherjee (Glucometer Starter Kit x 1)
(13, 6, 19, 1, 1099.00, 1099.00),

-- Order 7: Divya Nair (Sunscreen Gel x 1)
(14, 7, 21, 1, 379.00, 379.00),

-- Order 8: Meera Kulkarni (Lumbo Sacral Support Belt x 1 + Quad Walking Cane x 1)
(15, 8, 30, 1, 649.00, 649.00),
(16, 8, 31, 1, 580.00, 580.00),

-- Order 9: Kabir Mehta (Fingertip Pulse Oximeter x 1)
(17, 9, 17, 1, 699.00, 699.00),

-- Order 10: Tanvi Saxena (Omega-3 Fish Oil x 1)
(18, 10, 8, 1, 548.00, 548.00),

-- Order 11: Siddharth Iyer (Clinical Forehead Thermometer x 1 + Electric Heating Pad x 1)
(19, 11, 18, 1, 999.00, 999.00),
(20, 11, 32, 1, 749.00, 749.00),

-- Order 12: Kritika Sen (Bandages x 2 + Antiseptic Liquid x 1)
(21, 12, 11, 2, 89.00, 178.00),
(22, 12, 13, 1, 126.00, 126.00);

-- Done!

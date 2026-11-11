-- CreateTable
CREATE TABLE `admins` (
    `id` VARCHAR(10) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('super_admin', 'admin') NOT NULL DEFAULT 'admin',
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `last_login_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `admins_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `visitor_accounts` (
    `id` VARCHAR(10) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `domicile` VARCHAR(80) NOT NULL,
    `institution` VARCHAR(150) NULL,
    `education_level` ENUM('Mahasiswa', 'Pelajar', 'Umum') NOT NULL,
    `registered_at` DATE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `visitor_accounts_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `visits` (
    `id` VARCHAR(12) NOT NULL,
    `visitor_account_id` VARCHAR(10) NULL,
    `visitor_name` VARCHAR(100) NOT NULL,
    `domicile` VARCHAR(80) NOT NULL,
    `institution` VARCHAR(150) NULL,
    `education_level` ENUM('Mahasiswa', 'Pelajar', 'Umum') NOT NULL,
    `visit_date` DATE NOT NULL,
    `check_in_time` TIME(0) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `visits_visit_date_check_in_time_idx`(`visit_date`, `check_in_time`),
    INDEX `visits_visitor_account_id_idx`(`visitor_account_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bookings` (
    `id` VARCHAR(30) NOT NULL,
    `institution` VARCHAR(150) NOT NULL,
    `contact_name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `visit_date` DATE NOT NULL,
    `participant_count` INTEGER UNSIGNED NOT NULL,
    `notes` TEXT NULL,
    `status` ENUM('pending', 'confirmed', 'completed', 'rejected') NOT NULL DEFAULT 'pending',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `bookings_status_idx`(`status`),
    INDEX `bookings_created_at_idx`(`created_at`),
    INDEX `bookings_visit_date_idx`(`visit_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `collections` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `era` VARCHAR(50) NOT NULL,
    `period` VARCHAR(80) NULL,
    `origin` VARCHAR(120) NULL,
    `material` VARCHAR(100) NULL,
    `dimensions` VARCHAR(120) NULL,
    `meaning` TEXT NULL,
    `photo_url` VARCHAR(500) NULL,
    `video_url` VARCHAR(255) NULL,
    `pdf_url` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `collections_era_idx`(`era`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `visits` ADD CONSTRAINT `visits_visitor_account_id_fkey` FOREIGN KEY (`visitor_account_id`) REFERENCES `visitor_accounts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

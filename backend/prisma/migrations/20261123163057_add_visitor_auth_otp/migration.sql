-- AlterTable
ALTER TABLE `visitor_accounts` ADD COLUMN `email_verified_at` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `visitor_otps` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `account_id` VARCHAR(10) NOT NULL,
    `code_hash` VARCHAR(64) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `visitor_otps_account_id_created_at_idx`(`account_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `visitor_otps` ADD CONSTRAINT `visitor_otps_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `visitor_accounts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

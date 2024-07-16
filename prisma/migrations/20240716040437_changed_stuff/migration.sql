-- CreateTable
CREATE TABLE `Saved` (
    `savedId` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,

    UNIQUE INDEX `Saved_savedId_key`(`savedId`),
    PRIMARY KEY (`savedId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductSaved` (
    `productId` INTEGER NOT NULL,
    `savedId` INTEGER NOT NULL,

    PRIMARY KEY (`productId`, `savedId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Saved` ADD CONSTRAINT `Saved_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductSaved` ADD CONSTRAINT `ProductSaved_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`productId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductSaved` ADD CONSTRAINT `ProductSaved_savedId_fkey` FOREIGN KEY (`savedId`) REFERENCES `Saved`(`savedId`) ON DELETE RESTRICT ON UPDATE CASCADE;

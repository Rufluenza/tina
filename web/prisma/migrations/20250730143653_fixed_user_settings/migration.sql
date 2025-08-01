/*
  Warnings:

  - Made the column `lastSelectedContact` on table `UserSettings` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL DEFAULT 'User Settings',
    "theme" TEXT NOT NULL DEFAULT 'light',
    "language" TEXT NOT NULL DEFAULT 'en',
    "developmentMode" BOOLEAN NOT NULL DEFAULT false,
    "enableSms" BOOLEAN NOT NULL DEFAULT true,
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "lastSelectedContact" INTEGER NOT NULL,
    "sizeMultiplier" INTEGER NOT NULL DEFAULT 1,
    "enableVirtualKeyboard" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_UserSettings" ("createdAt", "developmentMode", "enableSms", "enableVirtualKeyboard", "id", "language", "lastSelectedContact", "name", "notificationsEnabled", "sizeMultiplier", "theme") SELECT "createdAt", "developmentMode", "enableSms", coalesce("enableVirtualKeyboard", false) AS "enableVirtualKeyboard", "id", "language", "lastSelectedContact", "name", "notificationsEnabled", coalesce("sizeMultiplier", 1) AS "sizeMultiplier", "theme" FROM "UserSettings";
DROP TABLE "UserSettings";
ALTER TABLE "new_UserSettings" RENAME TO "UserSettings";
CREATE UNIQUE INDEX "UserSettings_lastSelectedContact_key" ON "UserSettings"("lastSelectedContact");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

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
    "lastSelectedContact" INTEGER,
    "sizeMultiplier" INTEGER DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_UserSettings" ("createdAt", "developmentMode", "enableSms", "id", "language", "lastSelectedContact", "name", "notificationsEnabled", "theme") SELECT "createdAt", "developmentMode", "enableSms", "id", "language", "lastSelectedContact", "name", "notificationsEnabled", "theme" FROM "UserSettings";
DROP TABLE "UserSettings";
ALTER TABLE "new_UserSettings" RENAME TO "UserSettings";
CREATE UNIQUE INDEX "UserSettings_lastSelectedContact_key" ON "UserSettings"("lastSelectedContact");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

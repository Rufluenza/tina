-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Message" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "contactId" INTEGER NOT NULL,
    "direction" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Message" ("contactId", "content", "createdAt", "direction", "id") SELECT "contactId", "content", "createdAt", "direction", "id" FROM "Message";
DROP TABLE "Message";
ALTER TABLE "new_Message" RENAME TO "Message";
CREATE TABLE "new_UserSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL DEFAULT 'User Settings',
    "theme" TEXT NOT NULL DEFAULT 'light',
    "language" TEXT NOT NULL DEFAULT 'en',
    "developmentMode" BOOLEAN NOT NULL DEFAULT false,
    "enableSms" BOOLEAN NOT NULL DEFAULT true,
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "lastSelectedContactId" INTEGER,
    "sizeMultiplier" INTEGER NOT NULL DEFAULT 1,
    "enableVirtualKeyboard" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_UserSettings" ("createdAt", "developmentMode", "enableSms", "enableVirtualKeyboard", "id", "language", "lastSelectedContactId", "name", "notificationsEnabled", "sizeMultiplier", "theme") SELECT "createdAt", "developmentMode", "enableSms", "enableVirtualKeyboard", "id", "language", "lastSelectedContactId", "name", "notificationsEnabled", "sizeMultiplier", "theme" FROM "UserSettings";
DROP TABLE "UserSettings";
ALTER TABLE "new_UserSettings" RENAME TO "UserSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

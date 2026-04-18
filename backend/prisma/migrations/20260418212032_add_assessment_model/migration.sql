-- CreateTable
CREATE TABLE "Assessment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "studentId" INTEGER NOT NULL,
    "term" TEXT NOT NULL,
    "session" TEXT NOT NULL,
    "punctuality" INTEGER NOT NULL DEFAULT 5,
    "neatness" INTEGER NOT NULL DEFAULT 5,
    "honesty" INTEGER NOT NULL DEFAULT 5,
    "leadership" INTEGER NOT NULL DEFAULT 5,
    "creativity" INTEGER NOT NULL DEFAULT 5,
    "teacherComment" TEXT,
    "principalComment" TEXT,
    "attendance" INTEGER,
    "totalDays" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Assessment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Assessment_studentId_term_session_key" ON "Assessment"("studentId", "term", "session");

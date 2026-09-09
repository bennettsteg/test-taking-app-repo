-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "test_taking_app";

-- CreateEnum
CREATE TYPE "test_taking_app"."QuestionType" AS ENUM ('multiple_choice', 'true_false');

-- CreateEnum
CREATE TYPE "test_taking_app"."AttemptStatus" AS ENUM ('in_progress', 'completed');

-- CreateTable
CREATE TABLE "test_taking_app"."tests" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sourceFilename" TEXT,
    "rawImport" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_taking_app"."questions" (
    "id" SERIAL NOT NULL,
    "testId" INTEGER NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "type" "test_taking_app"."QuestionType" NOT NULL,
    "prompt" TEXT NOT NULL,
    "explanation" TEXT,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_taking_app"."question_options" (
    "id" SERIAL NOT NULL,
    "questionId" INTEGER NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,

    CONSTRAINT "question_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_taking_app"."test_attempts" (
    "id" SERIAL NOT NULL,
    "testId" INTEGER NOT NULL,
    "status" "test_taking_app"."AttemptStatus" NOT NULL DEFAULT 'completed',
    "totalQuestions" INTEGER NOT NULL,
    "correctCount" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "test_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_taking_app"."attempt_responses" (
    "id" SERIAL NOT NULL,
    "attemptId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "selectedOptionId" INTEGER,
    "isCorrect" BOOLEAN NOT NULL,

    CONSTRAINT "attempt_responses_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "test_taking_app"."questions" ADD CONSTRAINT "questions_testId_fkey" FOREIGN KEY ("testId") REFERENCES "test_taking_app"."tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_taking_app"."question_options" ADD CONSTRAINT "question_options_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "test_taking_app"."questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_taking_app"."test_attempts" ADD CONSTRAINT "test_attempts_testId_fkey" FOREIGN KEY ("testId") REFERENCES "test_taking_app"."tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_taking_app"."attempt_responses" ADD CONSTRAINT "attempt_responses_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "test_taking_app"."test_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_taking_app"."attempt_responses" ADD CONSTRAINT "attempt_responses_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "test_taking_app"."questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_taking_app"."attempt_responses" ADD CONSTRAINT "attempt_responses_selectedOptionId_fkey" FOREIGN KEY ("selectedOptionId") REFERENCES "test_taking_app"."question_options"("id") ON DELETE SET NULL ON UPDATE CASCADE;

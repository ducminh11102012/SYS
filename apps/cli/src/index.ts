#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { Command } from "commander";
import dotenv from "dotenv";
import FormData from "form-data";
import fetch from "node-fetch";

dotenv.config();

const program = new Command();
const backendUrl = process.env.BACKEND_URL ?? "http://localhost:4000";

program.name("sys-cli").description("CLI quản trị nền tảng luyện thi học sinh giỏi online").version("1.0.0");

program
  .command("upload")
  .description("Upload đề PDF/DOCX để AI phân tích và tạo đề thi")
  .requiredOption("-f, --file <path>", "Path đến file đề")
  .action(async ({ file }) => {
    const filePath = path.resolve(file);
    const stream = fs.createReadStream(filePath);
    const form = new FormData();
    form.append("file", stream);

    const response = await fetch(`${backendUrl}/api/exams/upload`, {
      method: "POST",
      body: form as any,
      headers: form.getHeaders()
    });

    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  });

program
  .command("list")
  .description("List danh sách đề đã upload")
  .action(async () => {
    const response = await fetch(`${backendUrl}/api/exams`);
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  });

program
  .command("submit")
  .description("Nộp bài làm JSON để chấm")
  .requiredOption("-e, --exam <examId>", "Exam ID")
  .requiredOption("-c, --candidate <candidateId>", "Candidate ID")
  .requiredOption("-a, --answers <path>", "JSON file answers map partId -> answer")
  .action(async ({ exam, candidate, answers }) => {
    const answersObj = JSON.parse(fs.readFileSync(path.resolve(answers), "utf8"));
    const response = await fetch(`${backendUrl}/api/exams/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examId: exam, candidateId: candidate, answers: answersObj })
    });

    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  });

program
  .command("grade")
  .description("Xem kết quả chấm")
  .requiredOption("-s, --submission <submissionId>", "Submission ID")
  .action(async ({ submission }) => {
    const response = await fetch(`${backendUrl}/api/exams/grades/${submission}`);
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  });

program.parseAsync(process.argv);

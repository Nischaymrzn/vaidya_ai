# Vaidya AI

Vaidya AI is a web-based intelligent health companion for managing personal medical data, tracking vitals/symptoms, generating risk insights, and using AI-assisted health workflows.

## Introduction

Managing personal health effectively can be challenging, with medical records, prescriptions, and vitals often scattered across different platforms. Vaidya_AI is a web-based intelligent health companion designed to centralize personal health information, track vital metrics like blood pressure, BMI, and sugar levels, and provide actionable insights based on user data.
The platform helps users maintain a complete, structured health history in one accessible location, empowering them to recognize potential health risks early and improve communication with healthcare professionals. With a focus on simplicity and usability, Vaidya_AI supports users of all age groups in managing their health effectively.

## Core Features

- Authentication: email/password login, password reset, Google OAuth (web + mobile token flow), role-based access (`user` and `admin`)
- Health data modules: vitals, symptoms, medications, allergies, immunizations, medical records, medical files
- Dashboard and analytics: summary cards, trends, and activity insights
- AI scan: OCR-based extraction from uploaded medical images with optional Gemini-enhanced structuring
- AI insights and chat: context-aware responses using user health history and safeguards for severe symptom patterns
- Prediction endpoints: symptom-based predictions and model-driven heart disease, diabetes, brain tumor, and tuberculosis predictions
- Family health workflows
- Premium flow via Stripe checkout and webhook confirmation

## Tech Stack

- Frontend: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Radix UI, React Query, Axios
- Backend: Express 4, TypeScript, Mongoose, Passport (Google OAuth), JWT, Zod, Nodemailer
- AI/ML: ONNX Runtime (local models), Tesseract OCR, Gemini API integrations
- Storage/Integrations: MongoDB, Cloudinary, Stripe, SMTP provider
- Testing: Jest + Supertest (backend), Jest + Testing Library + Cypress (frontend)

## Repository Structure

```text
.
|-- frontend/                # Next.js client application
|   |-- app/                 # App Router pages/layouts/routes
|   |-- lib/                 # API clients, server actions, utilities
|   |-- components/          # Shared UI components
|   |-- tests/               # Unit/integration tests
|   `-- cypress/             # E2E tests
|-- server/                  # Express API
|   |-- src/
|   |   |-- routes/
|   |   |-- controller/
|   |   |-- services/
|   |   |-- repositories/
|   |   |-- models/
|   |   `-- prediction_models/
|   `-- tests/               # Unit/integration tests
`-- README.md
```

# Kintsugi: Your Real-Time Tax Companion

Kintsugi is an intelligent tax assistant designed to simplify tax management for Indian taxpayers. By leveraging the power of Google's Gemini AI, it automates data extraction from financial documents, provides real-time tax calculations, and offers personalized financial advice through an interactive chatbot.

## How It Works: The Document Upload Journey

The core of the application is its ability to understand and process user-uploaded documents. Here’s a step-by-step breakdown of the flow:

1.  **Upload**: The user initiates the process by dragging and dropping a financial document (like a payslip, Form 16, or investment proof) into the `FileUpload` component.

2.  **AI Processing**: The document is not stored on a server. Instead, it's converted to a base64 string in the browser and sent directly to the Gemini AI model via the official Google Generative AI SDK.

3.  **Contextual Prompts**: A highly specific, context-aware prompt is generated based on the type of document. This prompt instructs the AI to act as a tax expert and extract financial data in a structured JSON format. The user's profile (e.g., user type, assessment year) is included in the prompt to provide crucial context for accurate extraction.

4.  **Data Extraction**: Gemini analyzes the document and returns a structured JSON object containing transactions, salary breakdowns, tax deductions, and employer details. The AI is specifically instructed to categorize each financial event (e.g., mapping a Provident Fund deduction to the "80C Deduction" category).

5.  **User Confirmation**: The extracted data isn't immediately added to the user's main financial ledger. Instead, it is presented in a clean, editable confirmation modal (`ExtractedDataConfirmation`). This "human-in-the-loop" step is crucial for ensuring accuracy. The user can review, edit, or remove any transaction before accepting it.

6.  **State Update**: Once the user confirms the extracted data, the transactions are added to the central state managed by Zustand. This single action triggers a cascade of real-time updates across the entire application.

## Key Metrics: Your Financial Dashboard

As soon as financial data is added (either via AI extraction or manual entry), the dashboard on the `Home` page updates instantly. The following key metrics are calculated and displayed:

-   **Estimated Tax Liability**: This is the core metric, calculated in real-time by the `calculateTax` function in the application's state management. It considers total projected income, all available deductions, and the standard deduction to provide an accurate, up-to-the-minute estimate of the user's tax dues for the financial year under both tax regimes.
-   **Regime Recommendation**: The application calculates the tax liability under both the Old and New tax regimes. It then compares the two and recommends the regime that results in lower tax outgo, also displaying the potential savings.
-   **Deduction Utilization**: Progress bars provide a clear visual representation of how much of the available limits for major tax-saving sections (like 80C, 80D, and HRA) have been utilized.
-   **Recent Transactions**: A live-updating list of the most recent financial activities, providing a quick glance at the user's financial pulse.

## AI-Powered Recommendations

The application provides recommendations based on two sources:

1.  **Rule-Based Insights**: The `generateAIInsights` function contains pre-defined logic to spot common tax-saving opportunities. For example, if it detects that the user's 80C utilization is below 100%, it will automatically generate a high-priority insight suggesting further investment to maximize savings.
2.  **Dynamic Chatbot Advice**: The Tax Assistant chatbot can provide more nuanced, personalized recommendations by analyzing the user's complete financial context.

## The Tax Assistant Chatbot

The chatbot is a conversational interface to the user's financial data. It is designed to be context-aware.

When a user asks a question (e.g., "How can I save more money on taxes?"), the following data is packaged and sent to the Gemini model along with the user's query and the chat history:

-   **User Profile**: Details like user type (salaried/business), age, and city.
-   **Transactions**: The complete list of all income, deductions, and expenses.
-   **Tax Calculations**: The fully computed tax liability under both regimes, including gross income and total deductions.
-   **Deduction Utilization**: The current status of their tax-saving investments.

This rich context allows the chatbot to provide highly personalized, data-driven answers that go beyond generic advice.

## Understanding Tax Regimes: Old vs. New

The application provides a detailed and transparent comparison of the two tax regimes available to Indian taxpayers.

#### Old Tax Regime
-   **Concept**: This is the traditional tax regime that allows taxpayers to claim a wide range of deductions and exemptions to reduce their taxable income.
-   **Key Deductions**: HRA (House Rent Allowance), 80C (Provident Fund, ELSS, Life Insurance), 80D (Medical Insurance), and more.
-   **Calculation**: The application calculates the tax liability by first subtracting all the user's claimed deductions from their gross income. The resulting taxable income is then subjected to the Old Regime's tax slabs.

#### New Tax Regime
-   **Concept**: Introduced as a simpler alternative, this regime offers lower, concessional tax rates. However, to avail of these rates, taxpayers must forgo most of the common deductions and exemptions available under the Old Regime (including HRA and 80C).
-   **Calculation**: The calculation is more direct. The tax is computed on the gross income (minus only the standard deduction) using the New Regime's specific tax slabs.

The application's `calculateTaxLiability` function iterates through the tax slabs (defined in `src/types/index.js`) for the selected regime, applies the respective rates, and adds the standard 4% Health and Education Cess to arrive at the final tax figure.

## The Filing Hub

The `Filing Hub` page is the user's command center for preparing their tax returns. It consolidates all the necessary information and tools for a seamless filing experience:

-   **Filing Readiness Checklist**: A dynamic checklist that tracks the user's progress, ensuring they have all necessary documents and information (like linking Aadhaar with PAN).
-   **Document Repository**: A central location to view all uploaded documents.
-   **Export Tax Summary**: Users can export a comprehensive JSON summary of their tax calculations, which can be used for easy filing on the official government portal.

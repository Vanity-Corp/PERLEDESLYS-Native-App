@AGENTS.md

# Project Goal

This project is a React Native version of an existing React web application.

The React web project is the source of truth.

The objective is to reproduce the web application as closely as possible.

## Important

Do NOT redesign anything.

Do NOT improve the UI.

Do NOT simplify layouts.

Do NOT change spacing.

Do NOT change colors.

Do NOT change typography.

Do NOT rename components.

Do NOT change the architecture.

The final application should look as close as possible to the web application.

---

## Tech Stack

- Expo
- Expo Router
- NativeWind
- React Hook Form
- TanStack Query
- Zustand
- fetch API
- Zod

---

## Rules

Always preserve:

- business logic
- component hierarchy
- props
- state management
- folder structure
- validation
- API requests

Only replace web APIs with React Native equivalents.

Examples:

div -> View

span -> Text

button -> Pressable

img -> Expo Image

input -> TextInput

CSS -> NativeWind

Link -> Expo Router Link

localStorage -> SecureStore

window/document -> React Native APIs

Never invent new components.

If a web component exists, create the React Native equivalent using the same name whenever possible.

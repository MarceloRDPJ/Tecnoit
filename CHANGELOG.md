# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- New Project: **Relatório Interativo** (Financial BI Tool). A client-side dashboard for converting Excel/CSV financial data into interactive charts and PDF reports.
- Added "Relatório Interativo" card to the Projects Hub (`hub/projetos.html`) with filtering capabilities.

### Changed
- Refactored "Clients" section in `index.html` to replace static logos with an infinite text carousel (marquee) for a cleaner, modern look.
- Refactored "Clients" section in `index.html` to use a responsive grid layout and glassmorphism cards.
- Fixed visibility of TecnoIT logo in `index.html` by applying brightness/invert filters for dark mode compatibility.
- Standardized Footer across all site pages (Root and Projects) to include correct social links (Instagram, LinkedIn) and contact email.
- Fixed layout shift in Header navigation on `sobre.html` and `projetos.html` caused by font-weight changes on active state.
- Updated `sobre.html` container width for better alignment with the main layout.

### Fixed
- Resolved visibility issues with dark logos on dark backgrounds in the "Partners" section.
- Fixed "About Me" page navigation menu jumping when switching active states.

### Added
- Implemented "Intercepted Intelligence" section in RDP Insider (Epic Dashboard) to display news and leaks.
- Added "Mock Simulation Protocol" to `crawler.py` to ensure leak data is available even when external APIs fail.
- Enhanced "System Log" in Epic Dashboard with visual security logs and simulated encryption output.

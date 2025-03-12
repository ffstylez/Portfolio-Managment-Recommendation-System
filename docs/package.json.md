# package.json Documentation

## Overview
The package.json file is the primary configuration file for the Portfolio Management Recommendation System project. It defines project metadata, dependencies, and scripts needed for development and production.

## Purpose
This file serves as the manifest for the Node.js project, allowing npm or yarn to manage dependencies and run predefined scripts. It provides all the necessary information about the project's frontend and backend requirements.

## Key Components

### Project Metadata
- **Name**: portfolio-recommendation
- **Version**: 0.1.0
- **Private**: true (not intended for publishing to npm)
- **Main**: index.js

### Dependencies
The project relies on several libraries categorized into:

#### Frontend Libraries
- **React Ecosystem**: React (v18.3.1), React DOM, React Router DOM (v6.26.2)
- **Data Visualization**: Chart.js (v4.4.8), React-ChartJS-2, Recharts (v2.13.3)
- **UI Components**: React Select, React Loader Spinner
- **Drag and Drop**: @dnd-kit libraries for interactive elements

#### Backend Libraries
- **Server Framework**: Express (v4.21.0)
- **API Handling**: Axios for HTTP requests
- **Security**: bcrypt for password hashing, cors for handling cross-origin requests
- **Data Processing**: csv-parser, PapaParse for CSV operations

### Scripts
- `start`: Launch the React development server
- `build`: Create a production build
- `test`: Run tests using Jest
- `eject`: Eject from Create React App configuration

### Browser Compatibility
Configured to support:
- Production: Browsers with >0.2% market share, no dead browsers
- Development: Latest versions of Chrome, Firefox, and Safari

## Usage
This configuration file is used by:
- npm/yarn to install dependencies
- Build tools to create production builds
- Development servers to run the application locally
- Testing frameworks to run automated tests

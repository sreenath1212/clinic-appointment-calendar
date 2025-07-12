# 🏥 Clinic Appointment Calendar

A modern, responsive web application for managing clinic appointments with a beautiful calendar interface, built with React.

## ✨ Features

- **📅 Interactive Calendar View**: Full-month calendar with appointment indicators
- **📱 Mobile Day View**: Optimized mobile interface for daily appointment management
- **🎨 Dark/Light Mode**: Toggle between dark and light themes
- **🔍 Advanced Filtering**: Filter appointments by doctor, patient, and type
- **➕ Appointment Management**: Add, edit, and delete appointments
- **💾 Local Storage**: Data persists in browser localStorage
- **🎯 Modern UI/UX**: Beautiful gradients, animations, and responsive design

## 🚀 Live Demo

Visit the live application: [Clinic Calendar](https://sreenath1212.github.io/clinic-appointment-calendar)

## 🛠️ Technologies Used

- **React 19** - Modern React with hooks
- **CSS3** - Advanced styling with gradients and animations
- **Local Storage** - Client-side data persistence
- **GitHub Pages** - Hosting and deployment

## 📋 Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sreenath1212/clinic-appointment-calendar.git
   cd clinic-appointment-calendar
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Login Credentials

- **Email**: `staff@clinic.com`
- **Password**: `123456`

## 📱 Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run deploy` - Deploys to GitHub Pages

## 🌐 Deployment

This application is automatically deployed to GitHub Pages using GitHub Actions. Every push to the main branch triggers a new deployment.

### Manual Deployment

To deploy manually:

```bash
npm run deploy
```

## 🎨 Features in Detail

### Calendar View
- Interactive monthly calendar
- Appointment indicators with hover effects
- Click to add new appointments
- Visual distinction for today and past dates

### Mobile Day View
- Optimized for mobile devices
- Daily appointment list
- Quick add appointment functionality
- Appointment details with contact information

### Filtering System
- Filter by doctor
- Filter by patient
- Filter by appointment type
- Clear all filters option

### Appointment Management
- Create new appointments
- Edit existing appointments
- Delete appointments with confirmation
- Conflict detection
- Validation for past dates

### Dark Mode
- Toggle between light and dark themes
- Persistent theme preference
- Optimized colors for both modes

## 📁 Project Structure

```
clinic-calendar/
├── public/
│   ├── data/
│   │   └── clinicEntities.json    # Sample data
│   └── index.html
├── src/
│   ├── components/
│   │   ├── AppointmentFilter.jsx  # Filter component
│   │   ├── AppointmentForm.jsx    # Form for adding/editing
│   │   ├── CalendarView.jsx       # Main calendar view
│   │   ├── DarkModeToggle.jsx     # Theme toggle
│   │   ├── Login.jsx              # Login component
│   │   └── MobileDayView.jsx      # Mobile day view
│   ├── data/
│   │   └── staticData.js          # Static data and config
│   ├── utils/
│   │   ├── appointmentStateManager.js  # State management
│   │   └── localStorageHelpers.js      # Storage utilities
│   ├── App.js                     # Main app component
│   ├── App.css                    # Main styles
│   └── index.js                   # App entry point
└── package.json
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with Create React App
- Icons and emojis for better UX
- Modern CSS techniques for beautiful design

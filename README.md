# 🚗 Smart Traffic Management System using VANETs

A smart traffic monitoring and routing system built using **VANETs (Vehicle Ad-hoc Networks)** that enables users to register vehicles, authenticate securely, and receive optimized real-time route suggestions using **V2V (Vehicle-to-Vehicle)** and **V2I (Vehicle-to-Infrastructure)** communication. The system provides **weather-based routing**, **live user tracking**, and visualizes **India’s highest traffic congestion zones** using Google Maps and TomTom Traffic APIs.

---

## 🌟 Features

### 🔐 User & Vehicle Management
- User registration with **vehicle name & vehicle number**
- Secure login system
- Data storage using **Supabase**

### 🚘 VANET-Based Communication
- **V2V communication** for vehicle-to-vehicle alerts  
- **V2I communication** for infrastructure-based updates  

### 🗺️ Smart Real-Time Routing
- Route generation using:
  - Live user location
  - Real-time weather data
  - Traffic congestion levels  
- Provides intelligent, optimized routes  

### 📊 Traffic Visualization
- Displays **highest traffic areas across India**
- Uses **TomTom Traffic API** for congestion data
- Google Maps with traffic overlays
- **Top 10 congested locations** shown with bar chart

### 💻 Technologies Used
**Frontend:**  
- React (TypeScript)  
- Google Maps SDK  
- Recharts / Chart.js  

**Backend:**  
- Node.js + Express  
- TomTom Traffic API  
- Supabase (Database + Auth)



---

## 🚀 How It Works
1. User registers with vehicle details  
2. Logs in to access dashboard  
3. App fetches:
   - Live location
   - Traffic data from TomTom
   - Weather data  
4. VANET logic suggests best possible route  
5. Google Map displays optimized route  
6. Top 10 Indian traffic hotspots shown with chart visualization  

---



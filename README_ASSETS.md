# Shipmate Logistics — Client Media & Assets Management Guide

This document provides easy, step-by-step instructions for changing photos, videos, and logos on the **Shipmate Logistics** website.

---

## 📁 Media File Structure Overview

All media assets are stored inside the `assets/` directory:

```text
assets/
├── images/
│   ├── hero-poster.webp             <-- Hero Section Video Poster
│   ├── about-story.webp            <-- About Us Story Image
│   ├── krishna.webp                <-- Jai Shri Krishna Image
│   ├── logos/
│   │   ├── mainlogo.webp           <-- Website Logo
│   │   ├── favicon.ico             <-- Browser Tab Icon
│   │   └── logo-1.svg ... logo-8.svg <-- Client Logos
│   ├── services/
│   │   ├── service-ftl.webp        <-- Full Truckload Image
│   │   ├── service-project.webp    <-- Flatbed Transport Image
│   │   ├── service-multiaxle.webp  <-- ODC Multiaxle Image
│   │   ├── service-coldchain.webp  <-- Cold Chain Reefer Image
│   │   ├── service-ltl.webp        <-- Part Truckload Image
│   │   ├── service-express.webp    <-- Express Delivery Image
│   │   └── service-container.webp  <-- Container Movement Image
│   ├── fleet/
│   │   ├── fleet-container-32.webp <-- 32ft Container Truck
│   │   ├── fleet-container-40.webp <-- 40ft Multi-Axle Container
│   │   ├── fleet-flatbed.webp      <-- Flatbed Trailer Truck
│   │   ├── fleet-reefer.webp       <-- Refrigerated Reefer Truck
│   │   └── fleet-lcv.webp          <-- LCV 19ft Box Truck
│   └── team/
│       ├── mohit-sharma.webp       <-- Director Bio Photo
│       └── rahul-indora.webp       <-- Branch Manager Bio Photo
└── videos/
    ├── hero-loop.mp4               <-- Main Hero Background Video (MP4)
    └── hero-loop.webm              <-- Main Hero Background Video (WebM)
```

---

## 📸 Section-by-Section Photo & Video Guide

### 1. Hero Background Video & Poster
- **Video File**: `assets/videos/hero-loop.mp4` (and `hero-loop.webm`)
- **Poster Image**: `assets/images/hero-poster.webp`
- **Recommended Aspect Ratio**: `16:9` (Widescreen)
- **Recommended Video Resolution**: `1920 x 1080` (Full HD)
- **Recommended File Size**: Under `5 MB` (muted, looping background video)

---

### 2. Website Logo & Favicon
- **Main Brand Logo**: `assets/images/logos/mainlogo.webp` (Recommended size: `512 x 512` PNG or WebP)
- **Browser Favicon**: `assets/images/logos/favicon.ico`

---

### 3. About Us Page Story Photo
- **File**: `assets/images/about-story.webp`
- **Recommended Aspect Ratio**: `4:3` or `16:9`
- **Recommended Resolution**: `1200 x 900` pixels

---

### 4. Services Section Photos
Location: `assets/images/services/`

| Service Name | File Name | Recommended Ratio | Resolution |
| :--- | :--- | :--- | :--- |
| **Full Truckload (FTL)** | `service-ftl.webp` | `4:3` | `800 x 600` |
| **Flatbed Transport** | `service-project.webp` | `4:3` | `800 x 600` |
| **Over Dimensional (ODC)** | `service-multiaxle.webp` | `4:3` | `800 x 600` |
| **Cold Chain & Reefer** | `service-coldchain.webp` | `4:3` | `800 x 600` |
| **Part Truckload (LTL)** | `service-ltl.webp` | `4:3` | `800 x 600` |
| **Express Delivery** | `service-express.webp` | `4:3` | `800 x 600` |
| **Container Movement** | `service-container.webp` | `4:3` | `800 x 600` |

---

### 5. Fleet Section Photos
Location: `assets/images/fleet/`

| Fleet Vehicle | File Name | Recommended Ratio | Resolution |
| :--- | :--- | :--- | :--- |
| **32ft Single-Axle Container** | `fleet-container-32.webp` | `4:3` | `800 x 600` |
| **40ft Multi-Axle Container** | `fleet-container-40.webp` | `4:3` | `800 x 600` |
| **Flatbed Trailer** | `fleet-flatbed.webp` | `4:3` | `800 x 600` |
| **Refrigerated Reefer Truck** | `fleet-reefer.webp` | `4:3` | `800 x 600` |
| **LCV 19ft Box Truck** | `fleet-lcv.webp` | `4:3` | `800 x 600` |

---

### 6. Leadership Team Bio Photos
Location: `assets/images/team/`

- **Director (Mr. Mohit Sharma)**: `mohit-sharma.webp`
- **Branch Manager (Mr. Rahul Indora)**: `rahul-indora.webp`
- **Recommended Ratio**: `1:1` (Square)
- **Recommended Resolution**: `400 x 400` pixels

---

## 🛠️ How to Replace Any Photo or Video (Quick 3-Step Method)

1. **Prepare Your New File**:
   - Ensure the new image or video is in the recommended format (`.webp` or `.jpg` for photos, `.mp4` for videos).
   - Resize/compress the image to keep page load times fast (e.g. using free tools like [TinyPNG](https://tinypng.com)).

2. **Match the Exact Filename**:
   - Rename your new image or video file to match the **exact filename** listed above (e.g. `service-ftl.webp`).

3. **Overwrite the File**:
   - Copy and paste your new file into its respective folder inside `assets/images/` or `assets/videos/`, replacing the old file.

> **Tip**: If you are using GitHub, commit and push your changes to automatically deploy the updated photos to your live website!

"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Code, Palette, Globe, Database, FileUp } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import JSZip from "jszip"

interface ProjectTemplate {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  files: {
    path: string
    content: string
  }[]
}

const projectTemplates: ProjectTemplate[] = [
  {
    id: "html-css-js",
    name: "HTML, CSS & JavaScript",
    description: "A basic web project with HTML, CSS, and JavaScript files",
    icon: <Globe className="h-8 w-8 text-blue-500" />,
    files: [
      {
        path: "index.html",
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Web Project</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header>
    <h1>Welcome to My Web Project</h1>
  </header>
  
  <main>
    <section class="hero">
      <h2>Getting Started</h2>
      <p>This is a simple HTML, CSS, and JavaScript project template.</p>
      <button id="clickMe">Click Me!</button>
    </section>
  </main>
  
  <footer>
    <p>&copy; 2025 My Web Project</p>
  </footer>

  <script src="script.js"></script>
</body>
</html>`,
      },
      {
        path: "styles.css",
        content: `/* Base styles */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  line-height: 1.6;
  color: #333;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* Header */
header {
  text-align: center;
  margin-bottom: 40px;
}

header h1 {
  color: #0070f3;
}

/* Hero section */
.hero {
  background-color: #f5f5f5;
  padding: 40px;
  border-radius: 8px;
  text-align: center;
}

/* Button */
button {
  background-color: #0070f3;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #0051a2;
}

/* Footer */
footer {
  margin-top: 40px;
  text-align: center;
  color: #666;
}`,
      },
      {
        path: "script.js",
        content: `// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Get the button element
  const button = document.getElementById('clickMe');
  
  // Add a click event listener
  button.addEventListener('click', function() {
    alert('Hello, World! The button was clicked.');
  });
  
  // Log a message to the console
  console.log('Script loaded successfully!');
});`,
      },
    ],
  },
  {
    id: "portfolio",
    name: "Portfolio Website",
    description: "A responsive portfolio website template with multiple sections",
    icon: <Palette className="h-8 w-8 text-purple-500" />,
    files: [
      {
        path: "index.html",
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Portfolio</title>
  <link rel="stylesheet" href="styles.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>
<body>
  <header>
    <div class="container">
      <nav>
        <div class="logo">My Portfolio</div>
        <ul class="nav-links">
          <li><a href="#home">Home</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#projects">Projects</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        <div class="hamburger">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </nav>
    </div>
  </header>

  <section id="home" class="hero">
    <div class="container">
      <div class="hero-content">
        <h1>Hello, I'm <span class="highlight">Your Name</span></h1>
        <h2>I'm a Web Developer</h2>
        <p>Welcome to my portfolio website. I create beautiful and functional websites.</p>
        <div class="cta-buttons">
          <a href="#projects" class="btn primary">View My Work</a>
          <a href="#contact" class="btn secondary">Contact Me</a>
        </div>
      </div>
    </div>
  </section>

  <section id="about" class="about">
    <div class="container">
      <h2 class="section-title">About Me</h2>
      <div class="about-content">
        <div class="about-text">
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor.</p>
          <p>Ut in nulla enim. Phasellus molestie magna non est bibendum non venenatis nisl tempor. Suspendisse dictum feugiat nisl ut dapibus.</p>
          <div class="skills">
            <h3>My Skills</h3>
            <div class="skill-item">
              <span>HTML/CSS</span>
              <div class="skill-bar">
                <div class="skill-level" style="width: 90%"></div>
              </div>
            </div>
            <div class="skill-item">
              <span>JavaScript</span>
              <div class="skill-bar">
                <div class="skill-level" style="width: 85%"></div>
              </div>
            </div>
            <div class="skill-item">
              <span>Responsive Design</span>
              <div class="skill-bar">
                <div class="skill-level" style="width: 80%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section id="projects" class="projects">
    <div class="container">
      <h2 class="section-title">My Projects</h2>
      <div class="project-grid">
        <div class="project-card">
          <div class="project-image"></div>
          <div class="project-info">
            <h3>Project One</h3>
            <p>A brief description of the project and the technologies used.</p>
            <div class="project-links">
              <a href="#" class="btn small">View Project</a>
              <a href="#" class="btn small secondary">Source Code</a>
            </div>
          </div>
        </div>
        <div class="project-card">
          <div class="project-image"></div>
          <div class="project-info">
            <h3>Project Two</h3>
            <p>A brief description of the project and the technologies used.</p>
            <div class="project-links">
              <a href="#" class="btn small">View Project</a>
              <a href="#" class="btn small secondary">Source Code</a>
            </div>
          </div>
        </div>
        <div class="project-card">
          <div class="project-image"></div>
          <div class="project-info">
            <h3>Project Three</h3>
            <p>A brief description of the project and the technologies used.</p>
            <div class="project-links">
              <a href="#" class="btn small">View Project</a>
              <a href="#" class="btn small secondary">Source Code</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section id="contact" class="contact">
    <div class="container">
      <h2 class="section-title">Contact Me</h2>
      <div class="contact-content">
        <div class="contact-info">
          <div class="contact-item">
            <i class="fas fa-envelope"></i>
            <span>email@example.com</span>
          </div>
          <div class="contact-item">
            <i class="fas fa-phone"></i>
            <span>+1 234 567 890</span>
          </div>
          <div class="contact-item">
            <i class="fas fa-map-marker-alt"></i>
            <span>City, Country</span>
          </div>
          <div class="social-links">
            <a href="#"><i class="fab fa-github"></i></a>
            <a href="#"><i class="fab fa-linkedin"></i></a>
            <a href="#"><i class="fab fa-twitter"></i></a>
          </div>
        </div>
        <form class="contact-form">
          <div class="form-group">
            <label for="name">Name</label>
            <input type="text" id="name" required>
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" required>
          </div>
          <div class="form-group">
            <label for="message">Message</label>
            <textarea id="message" rows="5" required></textarea>
          </div>
          <button type="submit" class="btn primary">Send Message</button>
        </form>
      </div>
    </div>
  </section>

  <footer>
    <div class="container">
      <p>&copy; 2025 Your Name. All Rights Reserved.</p>
    </div>
  </footer>

  <script src="script.js"></script>
</body>
</html>`,
      },
      {
        path: "styles.css",
        content: `/* Base styles */
:root {
  --primary-color: #4a6cf7;
  --secondary-color: #2c3e50;
  --text-color: #333;
  --light-color: #f4f4f4;
  --dark-color: #333;
  --transition: all 0.3s ease;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: var(--text-color);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

section {
  padding: 80px 0;
}

.section-title {
  text-align: center;
  margin-bottom: 50px;
  font-size: 2.5rem;
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background-color: var(--primary-color);
}

.highlight {
  color: var(--primary-color);
}

/* Buttons */
.btn {
  display: inline-block;
  padding: 12px 30px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 5px;
  text-decoration: none;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
}

.btn:hover {
  background-color: #3a57d0;
  transform: translateY(-3px);
}

.btn.secondary {
  background-color: transparent;
  border: 2px solid var(--primary-color);
  color: var(--primary-color);
}

.btn.secondary:hover {
  background-color: var(--primary-color);
  color: white;
}

.btn.small {
  padding: 8px 15px;
  font-size: 0.9rem;
}

/* Header and Navigation */
header {
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
}

.nav-links {
  display: flex;
  list-style: none;
}

.nav-links li {
  margin-left: 30px;
}

.nav-links a {
  text-decoration: none;
  color: var(--text-color);
  font-weight: 500;
  transition: var(--transition);
}

.nav-links a:hover {
  color: var(--primary-color);
}

.hamburger {
  display: none;
  flex-direction: column;
  cursor: pointer;
}

.hamburger span {
  width: 25px;
  height: 3px;
  background-color: var(--text-color);
  margin: 3px 0;
  transition: var(--transition);
}

/* Hero Section */
.hero {
  height: 100vh;
  display: flex;
  align-items: center;
  background-color: var(--light-color);
  margin-top: 60px;
}

.hero-content {
  max-width: 800px;
}

.hero-content h1 {
  font-size: 3rem;
  margin-bottom: 20px;
}

.hero-content h2 {
  font-size: 2rem;
  margin-bottom: 20px;
  color: var(--secondary-color);
}

.hero-content p {
  font-size: 1.2rem;
  margin-bottom: 30px;
}

.cta-buttons {
  display: flex;
  gap: 15px;
}

/* About Section */
.about-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 50px;
}

.about-text {
  flex: 1;
}

.about-text p {
  margin-bottom: 20px;
}

.skills {
  margin-top: 30px;
}

.skills h3 {
  margin-bottom: 15px;
}

.skill-item {
  margin-bottom: 15px;
}

.skill-bar {
  width: 100%;
  height: 10px;
  background-color: #e0e0e0;
  border-radius: 5px;
  margin-top: 5px;
}

.skill-level {
  height: 100%;
  background-color: var(--primary-color);
  border-radius: 5px;
}

/* Projects Section */
.projects {
  background-color: var(--light-color);
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
}

.project-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: var(--transition);
}

.project-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
}

.project-image {
  height: 200px;
  background-color: #ddd;
  background-size: cover;
  background-position: center;
}

.project-info {
  padding: 20px;
}

.project-info h3 {
  margin-bottom: 10px;
}

.project-info p {
  margin-bottom: 15px;
  color: #666;
}

.project-links {
  display: flex;
  gap: 10px;
}

/* Contact Section */
.contact-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 50px;
}

.contact-item {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.contact-item i {
  font-size: 1.5rem;
  color: var(--primary-color);
  margin-right: 15px;
}

.social-links {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

.social-links a {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: var(--primary-color);
  color: white;
  border-radius: 50%;
  transition: var(--transition);
}

.social-links a:hover {
  transform: translateY(-5px);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-family: inherit;
}

.form-group textarea {
  min-height: 100px;
  font-family: monospace;
}

/* Footer */
footer {
  background-color: var(--dark-color);
  color: white;
  text-align: center;
  padding: 20px 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hamburger {
    display: flex;
  }
  
  .nav-links {
    position: absolute;
    top: 70px;
    left: 0;
    width: 100%;
    background-color: white;
    flex-direction: column;
    align-items: center;
    padding: 20px 0;
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
    transform: translateY(-150%);
    transition: var(--transition);
  }
  
  .nav-links.active {
    transform: translateY(0);
  }
  
  .nav-links li {
    margin: 15px 0;
  }
  
  .hero-content h1 {
    font-size: 2.5rem;
  }
  
  .hero-content h2 {
    font-size: 1.5rem;
  }
  
  .about-content,
  .contact-content {
    grid-template-columns: 1fr;
  }
}`,
      },
      {
        path: "script.js",
        content: `// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  
  hamburger.addEventListener('click', function() {
    navLinks.classList.toggle('active');
  });
  
  // Close mobile menu when clicking on a nav link
  const navItems = document.querySelectorAll('.nav-links a');
  navItems.forEach(item => {
    item.addEventListener('click', function() {
      navLinks.classList.remove('active');
    });
  });
  
  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 70, // Adjust for header height
          behavior: 'smooth'
        });
      }
    });
  });
  
  // Form submission
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get form values
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const message = document.getElementById('message').value;
      
      // Simple validation
      if (!name || !email || !message) {
        alert('Please fill in all fields');
        return;
      }
      
      // In a real application, you would send this data to a server
      console.log('Form submitted:', { name, email, message });
      alert('Thank you for your message! In a real application, this would be sent to a server.');
      
      // Reset form
      contactForm.reset();
    });
  }
  
  // Add animation to skill bars
  const skillBars = document.querySelectorAll('.skill-level');
  
  // Function to check if an element is in viewport
  function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
  
  // Function to animate skill bars when they come into view
  function animateSkillBars() {
    skillBars.forEach(bar => {
      if (isInViewport(bar) && !bar.classList.contains('animated')) {
        bar.classList.add('animated');
      }
    });
  }
  
  // Check on scroll
  window.addEventListener('scroll', animateSkillBars);
  
  // Check on initial load
  animateSkillBars();
});`,
      },
    ],
  },
  {
    id: "api-client",
    name: "API Client",
    description: "A simple API client with fetch and display functionality",
    icon: <Database className="h-8 w-8 text-green-500" />,
    files: [
      {
        path: "index.html",
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Client</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <header>
      <h1>API Client</h1>
      <p>A simple client to fetch and display data from APIs</p>
    </header>
    
    <main>
      <section class="api-form">
        <h2>Request Configuration</h2>
        <form id="apiForm">
          <div class="form-group">
            <label for="apiUrl">API URL</label>
            <input type="url" id="apiUrl" placeholder="https://api.example.com/data" required>
          </div>
          
          <div class="form-group">
            <label for="requestMethod">Method</label>
            <select id="requestMethod">
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="requestHeaders">Headers (JSON)</label>
            <textarea id="requestHeaders" placeholder='{"Content-Type": "application/json"}'></textarea>
          </div>
          
          <div class="form-group">
            <label for="requestBody">Request Body (JSON)</label>
            <textarea id="requestBody" placeholder='{"key": "value"}'></textarea>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn primary">Send Request</button>
            <button type="button" id="clearBtn" class="btn secondary">Clear</button>
          </div>
        </form>
      </section>
      
      <section class="response-section">
        <div class="response-header">
          <h2>Response</h2>
          <div class="response-meta">
            <div id="statusCode" class="status-code">-</div>
            <div id="responseTime" class="response-time">0ms</div>
          </div>
        </div>
        
        <div class="tabs">
          <button class="tab-btn active" data-tab="response">Response</button>
          <button class="tab-btn" data-tab="headers">Headers</button>
        </div>
        
        <div class="tab-content">
          <div id="responseTab" class="tab-pane active">
            <pre id="responseData">// Response will appear here</pre>
          </div>
          <div id="headersTab" class="tab-pane">
            <pre id="responseHeaders">// Response headers will appear here</pre>
          </div>
        </div>
      </section>
    </main>
    
    <footer>
      <p>API Client &copy; 2025</p>
    </footer>
  </div>

  <script src="script.js"></script>
</body>
</html>`,
      },
      {
        path: "styles.css",
        content: `/* Base styles */
:root {
  --primary-color: #3498db;
  --secondary-color: #2c3e50;
  --success-color: #2ecc71;
  --warning-color: #f39c12;
  --danger-color: #e74c3c;
  --light-color: #ecf0f1;
  --dark-color: #34495e;
  --text-color: #333;
  --border-color: #ddd;
  --border-radius: 4px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  line-height: 1.6;
  color: var(--text-color);
  background-color: #f5f5f5;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* Header */
header {
  text-align: center;
  margin-bottom: 30px;
}

header h1 {
  color: var(--primary-color);
  margin-bottom: 10px;
}

/* Main content */
main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

section {
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
  color: var(--secondary-color);
}

/* Form styles */
.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

input, select, textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-family: inherit;
  font-size: 14px;
}

textarea {
  min-height: 100px;
  font-family: monospace;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

/* Buttons */
.btn {
  padding: 10px 15px;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s, transform 0.2s;
}

.btn:hover {
  transform: translateY(-2px);
}

.btn.primary {
  background-color  transform 0.2s;
}

.btn:hover {
  transform: translateY(-2px);
}

.btn.primary {
  background-color: var(--primary-color);
  color: white;
}

.btn.primary:hover {
  background-color: #2980b9;
}

.btn.secondary {
  background-color: var(--light-color);
  color: var(--dark-color);
}

.btn.secondary:hover {
  background-color: #bdc3c7;
}

/* Response section */
.response-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.response-meta {
  display: flex;
  align-items: center;
  gap: 15px;
}

.status-code {
  padding: 5px 10px;
  border-radius: var(--border-radius);
  font-weight: bold;
  background-color: var(--light-color);
}

.status-code.success {
  background-color: var(--success-color);
  color: white;
}

.status-code.error {
  background-color: var(--danger-color);
  color: white;
}

.response-time {
  font-size: 14px;
  color: #666;
}

/* Tabs */
.tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 15px;
}

.tab-btn {
  padding: 10px 15px;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 500;
  color: #666;
  border-bottom: 2px solid transparent;
}

.tab-btn.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}

.tab-pane {
  display: none;
}

.tab-pane.active {
  display: block;
}

pre {
  background-color: #f8f8f8;
  padding: 15px;
  border-radius: var(--border-radius);
  overflow: auto;
  font-family: monospace;
  font-size: 14px;
  min-height: 200px;
  max-height: 400px;
}

/* Footer */
footer {
  text-align: center;
  margin-top: 30px;
  color: #666;
}

/* Responsive design */
@media (max-width: 768px) {
  main {
    grid-template-columns: 1fr;
  }
}`,
      },
      {
        path: "script.js",
        content: `document.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const apiForm = document.getElementById('apiForm');
  const apiUrlInput = document.getElementById('apiUrl');
  const requestMethodSelect = document.getElementById('requestMethod');
  const requestHeadersTextarea = document.getElementById('requestHeaders');
  const requestBodyTextarea = document.getElementById('requestBody');
  const clearBtn = document.getElementById('clearBtn');
  const statusCodeElement = document.getElementById('statusCode');
  const responseTimeElement = document.getElementById('responseTime');
  const responseDataElement = document.getElementById('responseData');
  const responseHeadersElement = document.getElementById('responseHeaders');
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  
  // Set default values
  apiUrlInput.value = 'https://jsonplaceholder.typicode.com/posts/1';
  requestHeadersTextarea.value = JSON.stringify({
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }, null, 2);
  
  // Tab switching
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all buttons and panes
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabPanes.forEach(pane => pane.classList.remove('active'));
      
      // Add active class to clicked button
      this.classList.add('active');
      
      // Show corresponding tab pane
      const tabId = this.getAttribute('data-tab');
      document.getElementById(tabId + 'Tab').classList.add('active');
    });
  });
  
  // Form submission
  apiForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get form values
    const url = apiUrlInput.value;
    const method = requestMethodSelect.value;
    
    // Parse headers
    let headers = {};
    try {
      if (requestHeadersTextarea.value.trim()) {
        headers = JSON.parse(requestHeadersTextarea.value);
      }
    } catch (error) {
      alert('Invalid JSON in headers field');
      return;
    }
    
    // Parse body for non-GET requests
    let body = null;
    if (method !== 'GET' && requestBodyTextarea.value.trim()) {
      try {
        body = JSON.parse(requestBodyTextarea.value);
      } catch (error) {
        alert('Invalid JSON in request body');
        return;
      }
    }
    
    // Prepare fetch options
    const options = {
      method,
      headers
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    // Reset response display
    statusCodeElement.textContent = '-';
    statusCodeElement.className = 'status-code';
    responseTimeElement.textContent = '0ms';
    responseDataElement.textContent = 'Loading...';
    responseHeadersElement.textContent = '';
    
    // Send request and measure time
    const startTime = performance.now();
    let responseTime = 0;

    try {
      const response = await fetch(url, options);
      const endTime = performance.now();
      responseTime = Math.round(endTime - startTime);
      
      // Update response time
      responseTimeElement.textContent = responseTime + 'ms';
      
      // Update status code
      statusCodeElement.textContent = response.status;
      if (response.ok) {
        statusCodeElement.classList.add('success');
      } else {
        statusCodeElement.classList.add('error');
      }
      
      // Display response headers
      const headerEntries = [...response.headers.entries()];
      const headersObj = Object.fromEntries(headerEntries);
      responseHeadersElement.textContent = JSON.stringify(headersObj, null, 2);
      
      // Display response data
      try {
        // Try to parse as JSON
        const data = await response.json();
        responseDataElement.textContent = JSON.stringify(data, null, 2);
      } catch (error) {
        // If not JSON, display as text
        const text = await response.text();
        responseDataElement.textContent = text;
      }
    } catch (error) {
      // Handle network errors
      const endTime = performance.now();
      responseTime = Math.round(endTime - startTime);
      
      responseTimeElement.textContent = responseTime + 'ms';
      statusCodeElement.textContent = 'ERR';
      statusCodeElement.classList.add('error');
      responseDataElement.textContent = 'Error: ' + error.message;
    }
  });
  
  // Clear button
  clearBtn.addEventListener('click', function() {
    requestHeadersTextarea.value = JSON.stringify({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }, null, 2);
    requestBodyTextarea.value = '';
    statusCodeElement.textContent = '-';
    statusCodeElement.className = 'status-code';
    responseTimeElement.textContent = '0ms';
    responseDataElement.textContent = '// Response will appear here';
    responseHeadersElement.textContent = '// Response headers will appear here';
  });
  
  // Initialize with sample data for POST
  requestMethodSelect.addEventListener('change', function() {
    if (this.value === 'POST' || this.value === 'PUT') {
      if (!requestBodyTextarea.value.trim()) {
        requestBodyTextarea.value = JSON.stringify({
          title: 'foo',
          body: 'bar',
          userId: 1
        }, null, 2);
      }
    }
  });
});`,
      },
    ],
  },
]

export default function NewProjectPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [zipFile, setZipFile] = useState<File | null>(null)
  const [folderFiles, setFolderFiles] = useState<FileList | null>(null)
  const [zipFileName, setZipFileName] = useState("")
  const [folderName, setFolderName] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const createProject = async () => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a project name",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)

    try {
      const projectId = uuidv4()
      const timestamp = Date.now()

      // Create project metadata
      const project = {
        id: projectId,
        name,
        description,
        createdAt: timestamp,
        updatedAt: timestamp,
      }

      // Save project metadata to localStorage
      const existingProjects = localStorage.getItem("web-editor-projects")
      const projects = existingProjects ? JSON.parse(existingProjects) : []
      projects.push(project)
      localStorage.setItem("web-editor-projects", JSON.stringify(projects))

      // Initialize IndexedDB for file storage if it doesn't exist
      const dbRequest = indexedDB.open("web-editor-files", 1)

      dbRequest.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object store for files
        if (!db.objectStoreNames.contains("files")) {
          const objectStore = db.createObjectStore("files", { keyPath: "path" })
          objectStore.createIndex("projectId", "projectId", { unique: false })
        }
      }

      dbRequest.onsuccess = async (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        try {
          if (zipFile && zipFile instanceof File) {
            // Process ZIP file
            const zip = new JSZip()
            const contents = await zip.loadAsync(zipFile)

            // Extract all files from the ZIP
            const extractedFiles = []

            // Process each file in the ZIP
            for (const [relativePath, zipEntry] of Object.entries(contents.files)) {
              if (!zipEntry.dir) {
                const content = await zipEntry.async("string")
                extractedFiles.push({
                  path: `${projectId}/${relativePath}`,
                  projectId,
                  content,
                  lastModified: timestamp,
                })
              }
            }

            // Add all files to IndexedDB in a single transaction
            const transaction = db.transaction(["files"], "readwrite")
            const objectStore = transaction.objectStore("files")

            // Add each file to the transaction
            for (const file of extractedFiles) {
              objectStore.add(file)
            }

            // Wait for the transaction to complete
            await new Promise<void>((resolve, reject) => {
              transaction.oncomplete = () => resolve()
              transaction.onerror = () => reject(transaction.error)
            })

            toast({
              title: "Project created",
              description: "Your project has been imported successfully",
            })
            router.push(`/editor/${projectId}`)
          } else if (folderFiles && folderFiles instanceof FileList) {
            // Process folder upload
            const files = Array.from(folderFiles)
            const importedFiles = []

            // Process each file in the folder
            for (const file of files) {
              try {
                // Read file content
                const content = await new Promise<string>((resolve, reject) => {
                  const reader = new FileReader()
                  reader.onload = (e) => resolve(e.target?.result as string)
                  reader.onerror = reject
                  reader.readAsText(file)
                })

                // Get relative path (remove any common parent directory)
                const relativePath = file.webkitRelativePath || file.name

                // Create file object
                importedFiles.push({
                  path: `${projectId}/${relativePath}`,
                  projectId,
                  content,
                  lastModified: timestamp,
                })
              } catch (error) {
                console.error(`Error processing file ${file.name}:`, error)
                // Continue with other files
              }
            }

            if (importedFiles.length === 0) {
              throw new Error("No valid files found in the folder")
            }

            // Add all files to IndexedDB in a single transaction
            const transaction = db.transaction(["files"], "readwrite")
            const objectStore = transaction.objectStore("files")

            // Add each file to the transaction
            for (const file of importedFiles) {
              objectStore.add(file)
            }

            // Wait for the transaction to complete
            await new Promise<void>((resolve, reject) => {
              transaction.oncomplete = () => resolve()
              transaction.onerror = () => reject(transaction.error)
            })

            toast({
              title: "Project created",
              description: `Your project has been imported successfully with ${importedFiles.length} files`,
            })
            router.push(`/editor/${projectId}`)
          } else if (selectedTemplate) {
            // Use selected template
            const template = projectTemplates.find((t) => t.id === selectedTemplate)

            if (template) {
              const templateFiles = template.files.map((file) => ({
                path: `${projectId}/${file.path}`,
                projectId,
                content: file.content,
                lastModified: timestamp,
              }))

              // Add template files to IndexedDB in a single transaction
              const transaction = db.transaction(["files"], "readwrite")
              const objectStore = transaction.objectStore("files")

              // Add each file to the transaction
              for (const file of templateFiles) {
                objectStore.add(file)
              }

              // Wait for the transaction to complete
              await new Promise<void>((resolve, reject) => {
                transaction.oncomplete = () => resolve()
                transaction.onerror = () => reject(transaction.error)
              })

              toast({
                title: "Project created",
                description: `Your project has been created using the ${template.name} template`,
              })
              router.push(`/editor/${projectId}`)
            }
          } else {
            // Create default files for a new project
            const defaultFiles = [
              {
                path: `${projectId}/index.html`,
                projectId,
                content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <h1>Welcome to ${name}</h1>
  <p>Start editing to see your changes!</p>

  <script src="script.js"></script>
</body>
</html>`,
                lastModified: timestamp,
              },
              {
                path: `${projectId}/styles.css`,
                projectId,
                content: `body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  line-height: 1.6;
  color: #333;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #0070f3;
}`,
                lastModified: timestamp,
              },
              {
                path: `${projectId}/script.js`,
                projectId,
                content: `// Your JavaScript code goes here
console.log('Hello, world!');`,
                lastModified: timestamp,
              },
            ]

            // Add default files to IndexedDB in a single transaction
            const transaction = db.transaction(["files"], "readwrite")
            const objectStore = transaction.objectStore("files")

            // Add each file to the transaction
            for (const file of defaultFiles) {
              objectStore.add(file)
            }

            // Wait for the transaction to complete
            await new Promise<void>((resolve, reject) => {
              transaction.oncomplete = () => resolve()
              transaction.onerror = () => reject(transaction.error)
            })

            toast({
              title: "Project created",
              description: "Your project has been created successfully",
            })
            router.push(`/editor/${projectId}`)
          }
        } catch (error) {
          console.error("Error creating project files:", error)
          toast({
            title: "Error",
            description: "Failed to create project files",
            variant: "destructive",
          })
          setIsCreating(false)
        }
      }

      dbRequest.onerror = (event) => {
        console.error("IndexedDB error:", event)
        toast({
          title: "Error",
          description: "Failed to initialize storage for your project",
          variant: "destructive",
        })
        setIsCreating(false)
      }
    } catch (error) {
      console.error("Failed to create project:", error)
      toast({
        title: "Error",
        description: "Failed to create your project",
        variant: "destructive",
      })
      setIsCreating(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Create New Project</h1>
        <ThemeToggle />
      </div>

      <Tabs defaultValue="blank">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="blank">
            <Code className="mr-2 h-4 w-4" />
            Blank Project
          </TabsTrigger>
          <TabsTrigger value="template">
            <Palette className="mr-2 h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="folder">
            <Upload className="mr-2 h-4 w-4" />
            Import Folder
          </TabsTrigger>
          <TabsTrigger value="zip">
            <FileUp className="mr-2 h-4 w-4" />
            Import ZIP
          </TabsTrigger>
        </TabsList>

        {/* Blank Project Tab */}
        <TabsContent value="blank">
          <Card>
            <CardHeader>
              <CardTitle>Create a blank project</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  placeholder="My Awesome Project"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="A brief description of your project"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={createProject} disabled={isCreating || !name.trim()} className="w-full">
                {isCreating ? "Creating..." : "Create Project"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Template Tab */}
        <TabsContent value="template">
          <Card>
            <CardHeader>
              <CardTitle>Choose a template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  placeholder="My Template Project"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="A brief description of your project"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-4 mt-6">
                <Label>Select a Template</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projectTemplates.map((template) => (
                    <div
                      key={template.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedTemplate === template.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        {template.icon}
                        <h3 className="font-medium">{template.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={createProject}
                disabled={isCreating || !name.trim() || !selectedTemplate}
                className="w-full"
              >
                {isCreating ? "Creating..." : "Create Project"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Folder Import Tab */}
        <TabsContent value="folder">
          <Card>
            <CardHeader>
              <CardTitle>Import from Folder</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  placeholder="My Imported Project"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="A brief description of your project"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="folderUpload">Project Folder</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById("folderUpload")?.click()}
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {folderName || "Choose Folder"}
                  </Button>
                  <input
                    type="file"
                    id="folderUpload"
                    webkitdirectory="true"
                    directory="true"
                    multiple
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setFolderFiles(e.target.files)
                        setFolderName(`${e.target.files.length} files selected`)
                      }
                    }}
                    className="hidden"
                  />
                </div>
                {folderName && <p className="text-sm text-muted-foreground mt-1">{folderName}</p>}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={createProject} disabled={isCreating || !name.trim() || !folderFiles} className="w-full">
                {isCreating ? "Creating..." : "Create Project"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* ZIP Import Tab */}
        <TabsContent value="zip">
          <Card>
            <CardHeader>
              <CardTitle>Import from ZIP file</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  placeholder="My Imported Project"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="A brief description of your project"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipFile">ZIP File</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById("zipFile")?.click()}
                    className="w-full"
                  >
                    <FileUp className="mr-2 h-4 w-4" />
                    {zipFileName || "Choose ZIP file"}
                  </Button>
                  <input
                    type="file"
                    id="zipFile"
                    accept=".zip"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        const file = e.target.files[0]
                        if (file.type === "application/zip" || file.name.endsWith(".zip")) {
                          setZipFile(file)
                          setZipFileName(file.name)
                        } else {
                          toast({
                            title: "Invalid file",
                            description: "Please upload a ZIP file",
                            variant: "destructive",
                          })
                        }
                      }
                    }}
                    className="hidden"
                  />
                </div>
                {zipFileName && <p className="text-sm text-muted-foreground mt-1">Selected: {zipFileName}</p>}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={createProject} disabled={isCreating || !name.trim() || !zipFile} className="w-full">
                {isCreating ? "Creating..." : "Create Project"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


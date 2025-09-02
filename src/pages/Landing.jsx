import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faArrowRight, faQuoteLeft, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

gsap.registerPlugin(ScrollTrigger);

export default function Landing() {
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const servicesRef = useRef(null);
  const teamRef = useRef(null);

  useEffect(() => {
    // Hero section animations
    gsap.fromTo(heroRef.current, 
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
    );

    // Stats bar animation
    gsap.fromTo(statsRef.current?.children,
      { opacity: 0, y: 30 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.8, 
        stagger: 0.2,
        scrollTrigger: {
          trigger: statsRef.current,
          start: "top 80%"
        }
      }
    );

    // Services animation
    gsap.fromTo(servicesRef.current?.children,
      { opacity: 0, x: -50 },
      { 
        opacity: 1, 
        x: 0, 
        duration: 0.8, 
        stagger: 0.1,
        scrollTrigger: {
          trigger: servicesRef.current,
          start: "top 80%"
        }
      }
    );

    // Team animation
    gsap.fromTo(teamRef.current?.children,
      { opacity: 0, scale: 0.8 },
      { 
        opacity: 1, 
        scale: 1, 
        duration: 0.6, 
        stagger: 0.1,
        scrollTrigger: {
          trigger: teamRef.current,
          start: "top 80%"
        }
      }
    );
  }, []);
  const features = [
    {
      title: "AI-Based Tax Analysis",
      role: "Core Feature",
      description: "Leverage smart algorithms to maximize your savings and compliance effortlessly.",
    },
    {
      title: "Enterprise Grade Security",
      role: "Security",
      description: "Your financial data is protected with industry-leading security and encryption.",
    },
    {
      title: "Instant Optimization",
      role: "Real-Time Processing",
      description: "Get immediate, actionable tax recommendations for every user scenario.",
    },
    {
      title: "Effortless Onboarding",
      role: "Easy Setup",
      description: "Sign up and get started in minutes with our simple, intuitive onboarding.",
    },
    {
      title: "Seamless Dashboard",
      role: "User Interface",
      description: "Manage, track, and review all your tax insights in one friendly dashboard.",
    },
    {
      title: "Regime & Deduction Helper",
      role: "Personalization",
      description: "Personalized regime and deduction analyses tailored for individuals and businesses.",
    },
  ];
  
  return (
    <div className="min-h-screen bg-black text-[#FFF9F3]">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-6">
        <div className="text-[#FFF9F3]">About Us</div>
        <div className="flex items-center space-x-2">
          
          <span className="text-2xl font-bold text-lime-400">OptiTax</span>
        </div>
        <div className="flex space-x-8 text-[#FFF9F3]">
          <span>Services</span>
          <span>Projects</span>
          <span>Reviews</span>
        </div>
      </header>

      {/* Hero Section */}
      <section ref={heroRef} className="px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center mb-8">
            
            <h1 className="text-6xl font-bold text-center">
            Smarter Tax, Safer Data For Everyone.
            </h1>
            
          </div>
          
          <p className="text-xl text-center mb-12 max-w-4xl mx-auto">
          Supercharge your tax planning with OptiTax : the AI-powered assistant that analyzes your finances, finds hidden savings, and keeps your data secure with zero hassle.
          </p>

          <div className="flex justify-center space-x-6 mb-16">
            <button className="bg-lime-400 text-black px-8 py-4 rounded-lg font-semibold hover:bg-lime-300 transition-colors">
              Start Your Tax Planning
            </button>
            <button className="bg-white text-black px-8 py-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
              Let's Collaborate
            </button>
          </div>

          <div className="flex items-center justify-center space-x-16">
            {/* Main Hero Image - Now using tax.jpg */}
            <div className="w-80 h-80 rounded-full overflow-hidden">
              <img 
                src="/tax2.jpeg" 
                alt="Hero Image" 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Experience Indicator */}
            <div className="flex flex-col items-left">
            <br />
              <div className="text-4xl font-bold">
              Designed with insights from leading <br />tax advisors and technology innovators
</div>
<div className="flex space-x-1 mb-4 mt-8">
                {[...Array(5)].map((_, i) => (
                  <FontAwesomeIcon key={i} icon={faStar} className="text-lime-400" />
                  
                ))}<h2 className="text-2xl "> Tax Buddy</h2>
                
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Bar */}
      <section ref={statsRef} className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl  mb-2 text-gray-400">Enterprise grade <br />security</div>
              
            </div>
            <div>
            <div className="text-3xl  mb-2 text-gray-400">Real-Time Analysis</div>
             
            </div>
            <div>
              <div className="text-3xl  mb-2  text-gray-400">Instant Tax Optimization</div>
              
            </div>
            <div>
              <div className="text-3xl  mb-2  text-gray-400">Effortless Onboarding</div>
              
            </div>
          </div>
        </div>
      </section>

      {/* Turning Ideas Into Masterpieces */}
      <section className="px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl font-bold mb-8">Intelligent Tax Solutions, Effortless Results.</h2>
              <p className="text-xl leading-relaxed">
              We streamline complexity into actionable savings for every client individual, business, or enterprise.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg p-6 h-64 w-auto flex flex-col justify-end">
                <div className="w-full h-32 bg-gray-700 rounded mb-4">
                <img 
                src="/tax4.jpeg" 
                alt="Hero Image" 
                className="w-full h-full object-cover"
              />
                </div>
                <div className="bg-lime-400 text-black px-4 py-2 rounded text-sm font-semibold inline-block">
                NEXT GEN TAX ASSISTANT
                </div>
                
              </div>
              <div className="bg-gray-800 rounded-lg s h-64 flex flex-col justify-center items-center">
                <div className="w-70 h-50 bg-gray-700 rounded-full mb-4 object-cover">
                <img 
                src="/tax6.jpeg" 
                alt="Hero Image" 
                className="w-full h-full object-cover"
              />
                </div>
                
                
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Services */}
      <section ref={servicesRef} className="px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 gap-16">
            <div>
              <h2 className="text-5xl font-bold mb-8">
                Our <span className="bg-lime-400 text-black px-4 py-2 rounded">Services</span>
              </h2>
              <p className="text-xl mb-12">
              We offer secure, AI-powered tax optimization that uncovers personalized savings and ensures compliance. Trusted by individuals, small businesses, and enterprises for simplified, efficient tax solutions.
              </p>
              
              <div className="space-y-6">
                {[
                  " AI-Based Tax Analysis",
                  " Secure Document Management", 
                  " Regime & Deduction Optimization",
                  " Seamless Dashboard Access"
                ].map((service, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <span className="text-xl">{service}</span>
                    <FontAwesomeIcon icon={faArrowRight} className="text-lime-400" />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-800 rounded-lg p-8">
                <div className="w-full h-32 bg-gray-700 rounded mb-6">
                <img 
                src="/tax3.jpeg" 
                alt="Hero Image" 
                className="w-full h-full object-cover"
              />
                </div>
                <h3 className="text-xl mb-4">Discover how effortless smart tax planning can be</h3>
                <button className="bg-lime-400 text-black px-6 py-3 rounded-lg font-semibold flex items-center space-x-2">
                  <span>See how it work</span>
                  <FontAwesomeIcon icon={faArrowRight} />
                </button>
                
              </div>
              
              
            </div>
          </div>
        </div>
      </section>

      
      <section className="px-8 py-20 text-center">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-6xl font-bold">
          Optimize<span className="text-lime-400"> + </span>  Save <span className="text-lime-400">+</span> Reimbursement
          </h2>
        </div>
      </section>

      {/* Meet Our Team */}
      {/*
      <section ref={teamRef} className="px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-bold mb-16 text-center">
            OptiTax <span className="bg-lime-400 text-black px-4 py-2 rounded">Features</span>
          </h2>
          
          <div className="grid grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-6 text-center">
                <div className="w-24 h-24 bg-gray-700 rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold mb-2">Team Member {index + 1}</h3>
                <p className="text-gray-400">Position Title</p>
                <p className="text-gray-500 text-sm mt-2">Team Image Placeholder</p>
              </div>
            ))}
          </div>
        </div>
      </section>*/}
      {/* Meet Our Team */}
      
<section ref={teamRef} className="px-8 py-20">
  <div className="max-w-7xl mx-auto">
    <h2 className="text-5xl font-bold mb-16 text-center">
      OptiTax <span className="bg-lime-400 text-black px-4 py-2 rounded">Features</span>
    </h2>
    <div className="grid grid-cols-3 gap-8">
      {features.map((feature, index) => (
        <div key={index} className="bg-gray-800 rounded-lg p-6 text-center">
          <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
          <p className="text-gray-400">{feature.role}</p>
          <p className="text-gray-500 text-sm mt-2">{feature.description}</p>
        </div>
      ))}
    </div>
  </div>
</section>


      {/* Testimonial */}
      <section className="px-8 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800 rounded-lg p-12 text-center">
            <p className="text-4xl text-lime-500 mb-8" >Vision </p>
            <p className="text-2xl leading-relaxed mb-8">
              We’re driven to make tax optimization effortless, secure, and accessible for everyone. By harnessing advanced AI, we simplify complex tax decisions, protect your financial data, and deliver personalized strategies tailored to your needs. Our goal is to empower individuals and businesses alike to maximize savings and stay confidently compliant—no expertise required.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <div className="w-16 h-16 bg-gray-700 rounded-full"></div>
              <div className="text-left">
                
                <p className="text-gray-400">Team OptiTax</p>
              </div>
            </div>
            
          </div>
          
          <div className="flex justify-center space-x-4 mt-8">
            <button className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <button className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </div>
      </section>

      {/*
      <section className="px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4">
            {[
              "UX Design", "App Design", "Dashboard", "Wireframe", "User Research",
              "Branding", "Web Design", "Mobile Design", "Prototyping", "Strategy"
            ].map((skill, index) => (
              <span key={index} className="bg-gray-800 text-[#FFF9F3] px-6 py-3 rounded-full text-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </section>
      */}

      {/* Get In Touch */}
      <section className="px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl font-bold mb-8">Get In Touch Today!</h2>
              <div className="flex space-x-4">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex-1 bg-gray-800 text-[#FFF9F3] px-6 py-4 rounded-lg border border-gray-700 focus:border-lime-400 focus:outline-none"
                />
                <button className="bg-lime-400 text-black px-8 py-4 rounded-lg font-semibold hover:bg-lime-300 transition-colors">
                  Submit
                </button>
              </div>
            </div>
            <div className="text-center">
              <div className="w-80 h-80 bg-gray-800 rounded-lg flex items-center justify-center mx-auto">
                <div className="text-gray-400 text-center">
                  <div className="w-75 h-75 bg-gray-700 rounded-full mx-auto mb-4 object-cover">
                  <img 
                src="/tax5.jpeg" 
                alt="Hero Image" 
                className="w-full h-full object-cover"
              />
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-lime-400 text-black py-16">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center space-x-2 mb-8">
            
            <span className="text-3xl font-bold">OptiTax</span>
          </div>
          <div className="grid grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-sm">
                <li>Home</li>
                <li>Features</li>
                <li>Pricing</li>
                <li>ContactUs</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Solutions</h3>
              <ul className="space-y-2 text-sm">
                <li>About Us</li>
                <li>Our Team</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Security & Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>Security & Legals</li>
                <li>Terms of Service</li>
                <li>Security Practices</li>
                
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm">
                <li>LinkedIn</li>
                <li>Twitter/X</li>
                <li>GitHub</li>
                <li>Email: support@optitax.com</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

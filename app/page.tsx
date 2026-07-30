'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import Portfolio from '@/components/Portfolio';
import Process from '@/components/Process';
import Pricing from '@/components/Pricing';
import About from '@/components/About';
import Testimonials from '@/components/Testimonials';
import FAQ from '@/components/FAQ';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';
import ProjectEstimatorModal from '@/components/ProjectEstimatorModal';
import ScrollToTop from '@/components/ScrollToTop';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function Home() {
  useScrollReveal();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<string | undefined>();

  const handleOpenEstimator = (pkg?: string) => {
    setSelectedPkg(pkg);
    setIsModalOpen(true);
  };

  const handleCloseEstimator = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Header onOpenEstimator={handleOpenEstimator} />
      <main>
        <Hero onOpenEstimator={handleOpenEstimator} />
        <Services />
        <Portfolio />
        <Process />
        <Pricing onOpenEstimator={handleOpenEstimator} />
        <About />
        <Testimonials />
        <FAQ />
        <CTA onOpenEstimator={handleOpenEstimator} />
      </main>
      <Footer />

      <ProjectEstimatorModal
        isOpen={isModalOpen}
        onClose={handleCloseEstimator}
        initialPackage={selectedPkg}
      />

      <ScrollToTop />
    </>
  );
}

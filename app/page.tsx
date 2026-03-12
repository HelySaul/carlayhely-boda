"use client";
import { useState, useCallback } from "react";
import Loader       from "@/components/Loader";
import Navbar       from "@/components/Navbar";
import Hero         from "@/components/Hero";
import OurStory     from "@/components/OurStory";
import Schedule     from "@/components/Schedule";
import Venue        from "@/components/Venue";
import Palette      from "@/components/Palette";
import Etiquette    from "@/components/Etiquette";
import DriveSection from "@/components/DriveSection";
import Footer       from "@/components/Footer";
import BibleVerse   from "@/components/BibleVerse";

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  const handleComplete = useCallback(() => setLoaded(true), []);

  return (
    <>
      <Loader onComplete={handleComplete} />

      <div
        style={{
          opacity:    loaded ? 1 : 0,
          transition: "opacity 0.7s ease",
        }}
      >
        <Navbar />
        <main>
          <Hero />
          <BibleVerse
            verse="Encontré al amor de mi vida; lo abracé y no lo soltaré"
            reference="Cantares 3:4"
          />
          <OurStory />
          <BibleVerse
            verse="Quien halla esposa halla la felicidad: muestras de su favor le ha dado el Señor"
            reference="Proverbios 18:22"
          />
          <Schedule />
          <BibleVerse
            verse="Jehová guardará tu salida y tu entrada desde ahora y para siempre"
            reference="Salmo 121:8"
          />
          <Venue />
          <BibleVerse
            verse="Toda tú eres hermosa, amada mía, y en ti no hay defecto"
            reference="Cantares 4:7"
          />
          <Palette />
          <BibleVerse
            verse="Que todo se haga decentemente y con orden"
            reference="1 Corintios 14:40"
          />
          <Etiquette />
          <BibleVerse
            verse="Grandes cosas ha hecho el Señor con nosotros, y estamos alegres"
            reference="Salmos 126:3"
          />
          <DriveSection />
        </main>
        <Footer />
      </div>
    </>
  );
}
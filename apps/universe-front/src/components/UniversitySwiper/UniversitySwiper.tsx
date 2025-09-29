'use client';

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import styles from "./UniversitySwiper.module.css";
import UniversityCard from "../ui/UniversityCard/UniversityCard";
import { useQuery } from "@tanstack/react-query";
import { fetchData } from "@/api/api";
import { useMemo } from "react";

interface Props {
  title: string;
  leaderboards?: boolean;
}

interface RankingData {
  universityId: number;
  avg: string;
}

export const universities = [
  {
    name: "Harvard University",
    location: "Cambridge, USA",
    rating: 4.9,
    description:
      "A private Ivy League research university known for its excellence in education and research.",
    url: "https://www.harvard.edu/",
  },
  {
    name: "Stanford University",
    location: "Stanford, USA",
    rating: 4.8,
    description:
      "One of the world's leading research and teaching institutions with exceptional entrepreneurial spirit.",
    url: "https://www.stanford.edu/",
  },
  {
    name: "MIT",
    location: "Cambridge, USA",
    rating: 4.9,
    description:
      "Massachusetts Institute of Technology is known for its research and education in physical sciences and engineering.",
    url: "https://www.mit.edu/",
  },
   {
    name: "Harvard University",
    location: "Cambridge, USA",
    rating: 4.9,
    description:
      "A private Ivy League research university known for its excellence in education and research.",
    url: "https://www.harvard.edu/",
  },
  {
    name: "Stanford University",
    location: "Stanford, USA",
    rating: 4.8,
    description:
      "One of the world's leading research and teaching institutions with exceptional entrepreneurial spirit.",
    url: "https://www.stanford.edu/",
  },
  {
    name: "MIT",
    location: "Cambridge, USA",
    rating: 4.9,
    description:
      "Massachusetts Institute of Technology is known for its research and education in physical sciences and engineering.",
    url: "https://www.mit.edu/",
  },
];

export default function UniversitySwiper({ title, leaderboards = false }: Props) {

  const { data: universitiesData } = useQuery({
    queryKey: ['universities'],
    queryFn: async () => await fetchData({ url: '/api/universities' })
  });

  const { data: rankingData } = useQuery({
    queryKey: ['ranking'],
    queryFn: async () => await fetchData({ url: '/ranking' }),
    enabled: leaderboards // Only fetch ranking data when leaderboards is true
  });

  const sortedUniversities = useMemo(() => {
    if (!leaderboards || !universitiesData || !rankingData) {
      return universitiesData;
    }

    // Create a map of universityId to rating for quick lookup
    const ratingMap = new Map<number, number>();
    rankingData.forEach((item: RankingData) => {
      ratingMap.set(item.universityId, parseFloat(item.avg));
    });

    // Sort universities by rating (highest first)
    return [...universitiesData].sort((a, b) => {
      const ratingA = ratingMap.get(a.id) || 0;
      const ratingB = ratingMap.get(b.id) || 0;
      return ratingB - ratingA;
    });
  }, [leaderboards, universitiesData, rankingData]);

  console.log('Universities data:', universitiesData);
  console.log('Ranking data:', rankingData);
  console.log('Sorted universities:', sortedUniversities);
  
  return (
    <div className="">
      <h2 className={styles.mainTitle}>{title}</h2>
    
      <Swiper
        modules={[Autoplay]}
        autoplay={{ delay: 2500, disableOnInteraction: false, pauseOnMouseEnter: true }}
        spaceBetween={16}
        slidesPerView={1}
        breakpoints={{
          640: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 4 },
        }}
        className={styles.swiper}
      >
        {/* @ts-expect-error bhccjqbevj */}
        {sortedUniversities?.map((uni, i) => (
          <SwiperSlide key={uni.id || i}>
            <UniversityCard uni={uni} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
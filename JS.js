document.addEventListener("DOMContentLoaded", () => {
    gsap.to(".hero h1", { opacity: 1, y: -10, duration: 1.5, ease: "power2.out" });
    gsap.to(".hero p", { opacity: 1, y: -10, duration: 1.5, ease: "power2.out", delay: 0.5 });

    const sections = document.querySelectorAll(".section");
    sections.forEach((section) => {
        gsap.to(section.querySelector("h2"), {
            scrollTrigger: {
                trigger: section,
                start: "top 80%",
                toggleActions: "play none none reverse"
            },
            opacity: 1,
            y: -10,
            duration: 1.5
        });

        gsap.to(section.querySelector("p, ul"), {
            scrollTrigger: {
                trigger: section,
                start: "top 75%",
                toggleActions: "play none none reverse"
            },
            opacity: 1,
            y: -10,
            duration: 1.5,
            delay: 0.3
        });
    });
});

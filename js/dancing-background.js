const dancingSilhouettes = [
  // Tanzende Person 1
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M50,10 C55,10 60,15 60,20 C60,25 55,30 50,30 C45,30 40,25 40,20 C40,15 45,10 50,10 M45,30 L45,60 M55,30 L55,60 M45,40 C25,50 25,70 45,80 M55,40 C75,50 75,70 55,80"/>
  </svg>`,
  // Tanzende Person 2
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M50,10 C55,10 60,15 60,20 C60,25 55,30 50,30 C45,30 40,25 40,20 C40,15 45,10 50,10 M50,30 L50,50 M30,40 L50,50 L70,40 M50,50 L40,80 M50,50 L60,80"/>
  </svg>`,
  // Tanzende Person 3
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M50,10 C55,10 60,15 60,20 C60,25 55,30 50,30 C45,30 40,25 40,20 C40,15 45,10 50,10 M50,30 L50,60 M30,45 L50,60 M50,60 L70,45 M50,60 L50,90"/>
  </svg>`,
  // DJ Person
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M50,10 C55,10 60,15 60,20 C60,25 55,30 50,30 C45,30 40,25 40,20 C40,15 45,10 50,10 M50,30 L50,70 M20,40 L80,40 M30,30 L30,50 M70,30 L70,50"/>
  </svg>`,
  // Springende Person
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M50,10 C55,10 60,15 60,20 C60,25 55,30 50,30 C45,30 40,25 40,20 C40,15 45,10 50,10 M50,30 L50,50 M30,60 L50,50 L70,60 M40,90 L50,50 L60,90"/>
  </svg>`,
  // Tanzende Person 4
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M50,10 C55,10 60,15 60,20 C60,25 55,30 50,30 C45,30 40,25 40,20 C40,15 45,10 50,10 M45,30 L35,60 M55,30 L65,60 M35,60 L50,80 L65,60"/>
  </svg>`
];

function createDancingBackground() {
  const background = document.createElement('div');
  background.className = 'dancing-background';
  
  dancingSilhouettes.forEach((svg, index) => {
    const silhouette = document.createElement('div');
    silhouette.className = 'silhouette';
    silhouette.innerHTML = svg;
    background.appendChild(silhouette);
  });

  document.body.insertBefore(background, document.body.firstChild);
}

export function initBackground() {
  createDancingBackground();
}

uniform float uElevation;

#include getPerlinNoise2d;

float getElevation(vec2 _position){

  float elevation = 0.0;
  // General elevation
    elevation += cnoise(_position  * 0.3,) * 0.5 ;

  // Smaller details
    elevation += cnoise(_position + 123.0) * 0.2 ;

    elevation *= uElevation;



  return elevation;
}

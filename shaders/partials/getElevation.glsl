uniform float uElevation;

#include getPerlinNoise3d;

float getElevation(vec2 _position){

  float elevation = 0.0;
  // General elevation
    elevation += cnoise(vec3(
      _position  * 0.3,
      0.0
    )) * 0.5 ;

  // Smaller details
    elevation += cnoise(vec3(
      (_position + 123.0)  * 1.,
      0.0
    )) * 0.2 ;

    elevation *= uElevation;



  return elevation;
}

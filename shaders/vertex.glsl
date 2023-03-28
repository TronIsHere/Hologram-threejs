#include partials/getElevation

varying float vElevation;
// uniform float uElevation;
uniform float uTime;


void main(){ 
    vec4 modelPosition = modelMatrix * vec4(position,1.0);

    float elevation = getElevation(modelPosition.xz + vec2(uTime * 0.03,uTime * 0.01));
    // float elevation = getElevation(modelPosition.xz);
    // elevation *= uElevation;
    modelPosition.y += elevation;
   
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position =projectionPosition;

    vElevation = elevation;
}
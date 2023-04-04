varying float vElevation;
varying vec2 vUv;
uniform sampler2D uTexture;
uniform float uHslHue;
uniform float uHslHueOffset;
uniform float uHslHueFrequency;
uniform float uHslLightness;
uniform float uHslLightnessVariation;
uniform float uHslLightnessFrequency;
#include partials/getPerlinNoise2d;
vec3 hsl2rgb( in vec3 c )
{
    vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );

    return c.z + c.y * (rgb-0.5)*(1.0-abs(2.0*c.z-1.0));
}
vec3 getRainbowColor(){
    float hue = uHslHueOffset+ cnoise(vUv * uHslHueFrequency) * uHslHue;
    float lightness = uHslLightness + cnoise((vUv * uHslLightnessFrequency + 1234.5) ) * uHslLightnessVariation;
    vec3 hslColor = vec3(hue,1.0,lightness);
    vec3 rainbowColor = hsl2rgb(hslColor);
    return rainbowColor;
}

void main(){
    vec3 uColor = vec3(1.,1.,1.);
 
   
    vec3 rainbowColor= getRainbowColor();
    vec4 textureColor = texture2D(uTexture,vec2(0,vElevation *10.));
    // float elevation = vElevation + 0.5;
    // float alpha = mod(vElevation * 10.0,1.0);
    // alpha = step(0.95,alpha);

    vec3 color = mix(uColor,rainbowColor,textureColor.r);
    gl_FragColor = vec4(color,textureColor.a);
}
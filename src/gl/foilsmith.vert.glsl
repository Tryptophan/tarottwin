#version 300 es
// The quad for foilsmith.frag: a_pos is the quad's corners in clip space (-1..1); v_uv runs 0..1
// across it, y down (top-left is 0, 0), as in Godot's UV. Draw it with a triangle strip:
// (-1, -1), (1, -1), (-1, 1), (1, 1). Place the quad wherever the card goes by scaling a_pos (or use a
// viewport); its proportions must match the card's (see foilsmith.frag).
precision highp float;

in vec2 a_pos;
out vec2 v_uv;

void main() {
	v_uv = vec2(a_pos.x * 0.5 + 0.5, 0.5 - a_pos.y * 0.5);
	gl_Position = vec4(a_pos, 0.0, 1.0);
}

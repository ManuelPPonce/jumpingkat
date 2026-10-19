import photo from "../img/img-maestra.png";

export function HeroVisual() {
  return (
    <img
      src={photo}
      alt="Instructora de JumpingKat de pie sobre un trampolín en el estudio"
      className="mx-auto max-h-[640px] w-full object-contain"
    />
  );
}

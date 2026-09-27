"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";

const TEMPLATE = "/social-media.png";

export default function ShareGenerator() {
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhoto(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const template = new Image();
    template.onload = () => {
      canvas.width = template.naturalWidth;
      canvas.height = template.naturalHeight;
      context.drawImage(template, 0, 0);
      if (photo) {
        const uploaded = new Image();
        uploaded.onload = () => {
          context.drawImage(uploaded, 741, 445, 320, 409);
          context.fillStyle = "rgba(255,255,255,.93)";
          context.fillRect(85, 755, 595, 62);
          context.fillStyle = "#10254f";
          context.textAlign = "center";
          context.font = "700 23px Arial";
          context.fillText(name || "Your name", 382, 779, 575);
          context.font = "14px Arial";
          context.fillText([designation, organisation].filter(Boolean).join(" · ") || "Your designation · Organisation", 382, 801, 575);
        };
        uploaded.src = photo;
      }
    };
    template.src = TEMPLATE;
  }, [photo, name, designation, organisation]);

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "75th-ipc-registration-post.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <section className="share-workspace">
      <form className="share-form" onSubmit={(event) => { event.preventDefault(); download(); }}>
        <h2>Your details</h2>
        <p>These details will appear with your photo on the post.</p>
        <div className="share-field"><label htmlFor="share-name">Name</label><input id="share-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Dr. Priya Sharma" /></div>
        <div className="share-field"><label htmlFor="share-designation">Designation</label><input id="share-designation" value={designation} onChange={(event) => setDesignation(event.target.value)} placeholder="e.g. Chief Pharmacist" /></div>
        <div className="share-field"><label htmlFor="share-organisation">Organisation</label><input id="share-organisation" value={organisation} onChange={(event) => setOrganisation(event.target.value)} placeholder="e.g. ABC Pharmaceuticals" /></div>
        <div className="share-field"><label htmlFor="share-photo">Upload image</label><div className="share-upload"><input id="share-photo" type="file" accept="image/*" onChange={handlePhoto} /></div></div>
        <div className="share-actions"><button className="btn btn-primary" type="submit" disabled={!photoFile}>Download post</button><button className="btn btn-quiet" type="button" onClick={() => { setName(""); setDesignation(""); setOrganisation(""); setPhoto(null); setPhotoFile(null); }}>Clear</button></div>
      </form>
      <div className="share-preview-wrap"><p className="share-preview-label">Live preview</p><div className="share-preview"><img src={TEMPLATE} alt="75th IPC social media post template" />{photo && <img className="share-photo" src={photo} alt="Uploaded profile" />}<div className="share-identity"><strong>{name || "Your name"}</strong><span>{[designation, organisation].filter(Boolean).join(" · ") || "Your designation · Organisation"}</span></div></div><canvas ref={canvasRef} hidden /></div>
    </section>
  );
}

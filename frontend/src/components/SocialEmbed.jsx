import React from 'react';
import { InstagramEmbed, TwitterEmbed, YouTubeEmbed, TikTokEmbed, FacebookEmbed } from 'react-social-media-embed';

const SocialEmbed = ({ url }) => {
  if (!url) return null;

  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    margin: '30px 0',
    width: '100%'
  };

  // Detectar Instagram
  if (url.includes('instagram.com')) {
    return (
      <div style={containerStyle}>
        <InstagramEmbed url={url} width={328} />
      </div>
    );
  }

  // Detectar Twitter / X
  if (url.includes('twitter.com') || url.includes('x.com')) {
    return (
      <div style={containerStyle}>
        <TwitterEmbed url={url} width={325} />
      </div>
    );
  }

  // Detectar YouTube
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return (
      <div style={containerStyle}>
        <YouTubeEmbed url={url} width={560} height={315} />
      </div>
    );
  }
  
  // Detectar TikTok
  if (url.includes('tiktok.com')) {
    return (
      <div style={containerStyle}>
        <TikTokEmbed url={url} width={325} />
      </div>
    );
  }

  // Por defecto, si es un link desconocido, lo mostramos como botón
  return (
    <div style={{textAlign: 'center', margin: '20px 0'}}>
        <a href={url} target="_blank" rel="noopener noreferrer" 
           style={{color: '#3498DB', fontWeight: 'bold', textDecoration: 'underline'}}>
            Ver publicación original 🔗
        </a>
    </div>
  );
};

export default SocialEmbed;
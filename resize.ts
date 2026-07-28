import sharp from 'sharp';

async function resizeImage() {
  try {
    await sharp('public/nurr.png')
      .resize(300, 300, { fit: 'inside' })
      .toFile('public/nurr_small.png');
    console.log('Image compressed to public/nurr_small.png');
  } catch (error) {
    console.error('Error compressing image:', error);
  }
}

resizeImage();

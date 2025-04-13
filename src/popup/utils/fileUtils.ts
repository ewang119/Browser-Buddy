export async function getImagesFromDirectory(directory: FileList): Promise<string[]> {
  const imagePromises: Promise<string>[] = [];

  for (const file of Array.from(directory)) {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      const promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
      });
      reader.readAsDataURL(file);
      imagePromises.push(promise);
    }
  }

  return Promise.all(imagePromises);
}

// // src/utils/pdfShareUtils.js

// // No longer importing html2canvas, jsPDF, createRoot, or themeRegistry here.
// // These are now expected to be handled by the calling component.

// /**
//  * Uploads a PDF Blob to S3 via the backend.
//  * This function remains in the utility as it's a generic backend interaction.
//  *
//  * @param {Blob} pdfBlob - The PDF data as a Blob.
//  * @param {string} estimateId - The ID of the estimate.
//  * @param {string} clientName - The client's name for filename.
//  * @param {string} functionName - The function name for filename.
//  * @param {string} firebaseUID - The Firebase UID of the current user.
//  * @param {function} setModalMessage - Function to update the modal message.
//  * @param {function} setModalType - Function to update the modal type.
//  * @returns {Promise<string|null>} A promise that resolves with the S3 public URL or null.
//  */
// export const uploadPdfToS3Backend = async (pdfBlob, estimateId, clientName, functionName, firebaseUID, setModalMessage, setModalType) => {
//   setModalMessage("Uploading PDF to cloud storage...");
//   setModalType("loading");
//   const backendUrl = import.meta.env.VITE_BACKEND_URL;
//   if (!backendUrl) {
//     setModalMessage("Backend URL is not defined.");
//     setModalType("error");
//     console.error("VITE_BACKEND_URL is not defined in your environment variables.");
//     return null;
//   }

//   const reader = new FileReader();
//   reader.readAsDataURL(pdfBlob);

//   return new Promise((resolve, reject) => {
//     reader.onloadend = async () => {
//       const base64data = reader.result.split(',')[1]; // Get base64 part

//       const fileName = `${functionName}_${clientName}_${estimateId}.pdf`.replace(/[^a-zA-Z0-9_.-]/g, '_');

//       try {
//         const response = await fetch(`${backendUrl}/api/estimates/upload-pdf-s3`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             pdfBase64: base64data,
//             fileName: fileName,
//             firebaseUID: firebaseUID,
//           }),
//         });

//         if (!response.ok) {
//           const errorData = await response.json();
//           throw new Error(`Backend S3 upload failed: ${errorData.message || response.statusText}`);
//         }

//         const result = await response.json();
//         resolve(result.pdfUrl);

//       } catch (error) {
//         console.error("Error uploading PDF to S3 via backend:", error);
//         setModalMessage("Failed to upload PDF. Please check backend logs.");
//         setModalType("error");
//         reject(null);
//       }
//     };
//     reader.onerror = (error) => {
//       console.error("Error reading PDF blob:", error);
//       setModalMessage("Failed to read PDF data for upload.");
//       setModalType("error");
//       reject(null);
//     };
//   });
// };

// /**
//  * Updates the estimate record in MongoDB with the new PDF URL and status.
//  * This function remains in the utility as it's a generic backend interaction.
//  *
//  * @param {string} estimateId - The ID of the estimate to update.
//  * @param {string} pdfUrl - The S3 URL of the uploaded PDF.
//  * @param {string} firebaseUID - The Firebase UID of the current user.
//  * @param {function} setModalMessage - Function to update the modal message.
//  * @param {function} setModalType - Function to update the modal type.
//  * @returns {Promise<boolean>} A promise that resolves to true on success, false on failure.
//  */
// export const updateEstimateInDb = async (estimateId, pdfUrl, firebaseUID, setModalMessage, setModalType) => {
//   setModalMessage(`Updating estimate record in database...`);
//   setModalType("loading");
//   const backendUrl = import.meta.env.VITE_BACKEND_URL;
//   if (!backendUrl) {
//       setModalMessage("Backend URL is not defined.");
//       setModalType("error");
//       throw new Error("VITE_BACKEND_URL is not defined in your environment variables.");
//   }

//   try {
//     const response = await fetch(`${backendUrl}/api/estimates/${estimateId}/update-pdf-url`, {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         pdfUrl: pdfUrl,
//         status: 'sent', // Always set status to 'sent' when sharing
//         firebaseUID: firebaseUID,
//       }),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(`Failed to update estimate in MongoDB: ${errorData.message || response.statusText}`);
//     }

//     const updateResult = await response.json();
//     console.log("MongoDB update response:", updateResult);
//     setModalMessage("Estimate record updated successfully!");
//     setModalType("success");
//     return true;

//   } catch (error) {
//     console.error("Error updating estimate in MongoDB:", error);
//     setModalMessage(`Failed to update estimate in database: ${error.message}`);
//     setModalType("error");
//     return false;
//   }
// };

// src/utils/pdfShareUtils.js

// No longer importing html2canvas, jsPDF, createRoot, or themeRegistry here.
// These are now expected to be handled by the calling component.

/**
 * Gets a presigned URL from the backend and uploads the PDF Blob directly to S3.
 *
 * @param {Blob} pdfBlob - The PDF data as a Blob.
 * @param {string} estimateId - The ID of the estimate.
 * @param {string} clientName - The client's name for filename.
 * @param {string} functionName - The function name for filename.
 * @param {string} firebaseUID - The Firebase UID of the current user.
 * @param {function} setModalMessage - Function to update the modal message.
 * @param {function} setModalType - Function to update the modal type.
 * @returns {Promise<string|null>} A promise that resolves with the S3 public URL or null.
 */
export const uploadPdfToS3Backend = async (pdfBlob, estimateId, clientName, functionName, firebaseUID, setModalMessage, setModalType) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    if (!backendUrl) {
        setModalMessage("Backend URL is not defined.");
        setModalType("error");
        console.error("VITE_BACKEND_URL is not defined in your environment variables.");
        return null;
    }

    // Generate a unique filename for S3. Using the estimateId ensures uniqueness per estimate.
    // The replace() cleans up any characters not suitable for S3 keys.
    const fileName = `${functionName}_${clientName}_${estimateId}.pdf`.replace(/[^a-zA-Z0-9_.\-]/g, '_');
    const contentType = 'application/pdf'; // Essential for S3 to handle the file correctly

    setModalMessage("Requesting secure upload link...");
    setModalType("loading");

    try {
        // --- Step 1: Request a presigned URL from your backend ---
        const presignResponse = await fetch(`${backendUrl}/api/estimates/generate-s3-presigned-url`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // IMPORTANT: If your backend's presigned URL endpoint requires authentication
                // (e.g., Firebase ID Token via Authorization header), include it here.
                // For example: 'Authorization': `Bearer ${await auth.currentUser.getIdToken()}`
                // Based on your backend, you're passing firebaseUID in the body, which is fine,
                // but consider a proper Authorization header if security is a higher concern.
            },
            body: JSON.stringify({
                fileName: fileName,
                contentType: contentType,
                firebaseUID: firebaseUID, // Pass firebaseUID for backend authorization
            }),
        });

        if (!presignResponse.ok) {
            const errorData = await presignResponse.json();
            throw new Error(`Failed to get presigned URL from backend: ${errorData.message || presignResponse.statusText}`);
        }

        const { presignedUrl, publicUrl } = await presignResponse.json();

        if (!presignedUrl || !publicUrl) {
            throw new Error('Backend did not return valid presignedUrl or publicUrl.');
        }

        setModalMessage("Uploading PDF directly to cloud storage...");
        setModalType("loading");

        // --- Step 2: Upload the PDF Blob directly to S3 using the presigned URL ---
        const s3UploadResponse = await fetch(presignedUrl, {
            method: 'PUT', // Use PUT method for direct S3 upload
            headers: {
                'Content-Type': 'application/pdf', // CRUCIAL: Must match the Content-Type requested when generating the presigned URL
                // Do NOT include 'Access-Control-Allow-Origin' here. The browser handles CORS for direct S3 upload.
            },
            body: pdfBlob, // Send the raw Blob directly. No JSON.stringify.
        });

        if (!s3UploadResponse.ok) {
            // S3's error responses might not be JSON. Fetch as text for debugging.
            const errorText = await s3UploadResponse.text();
            throw new Error(`Direct S3 upload failed: ${s3UploadResponse.status} ${s3UploadResponse.statusText}. Response: ${errorText.substring(0, 200)}...`); // Limit length
        }

        setModalMessage("PDF uploaded successfully!");
        setModalType("success"); // Update modal after successful S3 upload

        return publicUrl; // Return the public URL to be saved in your database

    } catch (error) {
        console.error("Error during S3 upload process:", error);
        setModalMessage(`Failed to upload PDF: ${error.message}`);
        setModalType("error");
        return null;
    }
};

/**
 * Updates the estimate record in MongoDB with the new PDF URL and status.
 * This function remains in the utility as it's a generic backend interaction.
 *
 * @param {string} estimateId - The ID of the estimate to update.
 * @param {string} pdfUrl - The S3 URL of the uploaded PDF.
 * @param {string} firebaseUID - The Firebase UID of the current user.
 * @param {function} setModalMessage - Function to update the modal message.
 * @param {function} setModalType - Function to update the modal type.
 * @returns {Promise<boolean>} A promise that resolves to true on success, false on failure.
 */
export const updateEstimateInDb = async (estimateId, pdfUrl, firebaseUID, setModalMessage, setModalType) => {
    setModalMessage(`Updating estimate record in database...`);
    setModalType("loading");
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    if (!backendUrl) {
        setModalMessage("Backend URL is not defined.");
        setModalType("error");
        throw new Error("VITE_BACKEND_URL is not defined in your environment variables.");
    }

    try {
        const response = await fetch(`${backendUrl}/api/estimates/${estimateId}/update-pdf-url`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                // IMPORTANT: If your backend's update endpoint requires authorization, include it here.
                // 'Authorization': `Bearer ${await auth.currentUser.getIdToken()}`,
                'firebaseUID': firebaseUID, // Pass firebaseUID for backend authorization
            },
            body: JSON.stringify({
                pdfUrl: pdfUrl,
                status: 'sent', // Always set status to 'sent' when sharing
                firebaseUID: firebaseUID, // Pass firebaseUID for backend to verify ownership
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to update estimate in MongoDB: ${errorData.message || response.statusText}`);
        }

        const updateResult = await response.json();
        console.log("MongoDB update response:", updateResult);
        setModalMessage("Estimate record updated successfully!");
        setModalType("success"); // Final success state after DB update
        return true;

    } catch (error) {
        console.error("Error updating estimate in MongoDB:", error);
        setModalMessage(`Failed to update estimate in database: ${error.message}`);
        setModalType("error");
        return false;
    }
};
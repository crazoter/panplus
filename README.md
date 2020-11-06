Panopto Plus

### Purpose of this project
To create a chrome extension to improve the webcasting experience for panopto. It will serve a few purposes:

1. Improve the user interface of the webcast page. 

2. Add transcript & subtitles. The idea is to add this into the user interface as subtitles and as a transcript section on the page that users can click and the video will skip to that part like in Youtube (example video which has transcripts / subtitles https://www.youtube.com/watch?v=xa-4IAR_9Yw). This should be implemented in the non-fullscreen and full-screen version.

3. Remove / Speed up sections where the prof is not speaking in the webcast (inspired by https://www.youtube.com/watch?v=DQ8orIurGxw). This will shorten the duration of the webcast and improve UX.

### Development Instructions
1. Clone this git repository on your computer.
2. Navigate to the cloned repository and execute `npm install`.
3. Launch Google Chrome & put in "chrome://extensions" in the URL.
4. Switch on Developer mode (top right corner).
5. Select "Load Unpacked" and select the "PanoptoPlus/dev" folder.
6. The extension is loaded. Whenever you need to modify and test code, load the extension like in step 4 and reload the page.
7. To build the documentation, execute `npm run make_docs`. Documentation uses jsdoc (refer to package.json).

### Download & Installation
You can download and install this chrome extension from the store via this URL: https://tinyurl.com/panplus.

### FAQ

##### I've encountered a bug / Something is not working! What do I do?
Please submit a new issue @ https://github.com/crazoter/panplus/issues. However, as the repository is no longer being actively maintained, your issue may or may not be resolved.

##### Silence Trimming is glitching the webcast / is not working!
If the silence trimming fails to work properly, please either disable it or adjust the noise z-value. Explanation: The current silence trimming implementation uses a ~330ms segment from the webcast as a reference point to define "noise". For silence trimming to work properly, this reference point needs to be noise. The selection of this segment is not rigorous; it is pulled 1.3s before the end of the webcast (because Panopto fades out the video and audio at the last second). Based on testing, this implementation works for webcasts in general, but there may be exceptions to this.

##### The extension isn't enabled / working properly on my webcast page?
Please submit a new issue @ https://github.com/crazoter/panplus/issues. Explanation: NUS has numerous domains for Panopto, each with their own database of webcasts (presumably to separate webcasts by faculty or category). This means, however, that we might've missed out a domain OR a domain might be running a different version of Panopto (resulting in your version of the chrome extension appearing/operating differently than expected). 

If you're using Panopto and you're not from NUS, the chrome extension would obviously fail to include the domain name of your organization. To resolve this, fork the repository and modify the `manifest.json` to add your organization's domain name.

The list of Panopto sites currently supported by this chrome extension:
* LumiNUS (Uses Panopto in an iframe)
* *.weblecture.nus.edu.sg (e.g. fac.weblecture.nus.edu.sg, med.weblecture.nus.edu.sg etc)
* *.ap.panopto.com (e.g. nuscast.ap.panopto.com, mediaweb.ap.panopto.com etc)

### Feature List
__User Interface__
  * __Double video webcast__
    * App specific sidebar [DONE]
    * Minimized carousel size [DONE]
    * Persistent settings [DONE]
    * Subtitles toggle option [DONE]
  * __Single video webcast__
    * App specific sidebar [DONE]
    * Minimize carousel size [DONE]
    * Consistent UI with Double video webcast [DONE]
  * __Mobile: Double video webcast__ [Responsive, but only for PC]
  * __Mobile: Single video webcast__ [Responsive, but only for PC]
  * Others
    * Volume booster [DONE]
    * Customizable UI [DONE]

__Transcripts__
* Extraction of transcripts [DONE]
* Separation of interface & implementation [DONE]
* Conversion of transcripts to WebVTT tracks for subtitling [DONE]
* Conversion of transcripts to DOM in sidebar [DONE]

__Silence Trimming__
* Implementation [DONE]

__Complete Conversion to ES6__
* Implementation [PARTIAL CONVERSION DONE. KIV, NOT PRIORITY]

__Webpack for deployment__
* Implementation [KIV]

### Interesting Keep In View (KIV) Concepts
* User submitted edits to subtitles 
  * To ensure integrity, submitters will have to login using NUS account to verify themselves with our server (OAuth2, https://wiki.nus.edu.sg/pages/viewpage.action?pageId=235638755).
  * Voting System with regards to which subtitle to prioritise
  * Symmetric Key Encryption of subtitles using the ID of the webcast as the key: ensures privacy of the subtitles is not compromised even if the server is compromised.
* Webcast download KIV
  * Downloaded webcast is sped-up, trimmed appropriately and subtitled. First, extract video. Then use ffmpeg to trim, speed up and the subtitle.
  * ffmpeg: https://github.com/Kagami/ffmpeg.js/
  * Speed: https://davidwalsh.name/video-speed
  * Slicing: https://superuser.com/questions/681885/how-can-i-remove-multiple-segments-from-a-video-using-ffmpeg
  * https://stackoverflow.com/questions/48268720/ffmpeg-commands-in-javascript
  * Burning the subs in (if configured by user): https://stackoverflow.com/questions/8672809/use-ffmpeg-to-add-text-subtitles
  * https://stackoverflow.com/questions/52543728/ffmpeg-adding-and-removing-subtitles-without-changing-the-video
* Other non-critical features e.g. export notes

# vaadin-litelement-zxing
ZXing integration on Vaadin 14

[![Bless](https://img.shields.io/badge/bless-Alpaca-brightgreen)](http://lunagao.github.io/BlessYourCodeTag/)

Usage:

```java
public class BarcodeScanner extends Dialog {
    public BarcodeScanner {
        final ZXingVaadinReader reader = new ZXingVaadinReader();
        reader.setFrom(Constants.From.camera);
        reader.setWidthFull();
        reader.onZxingErrorListener = e -> {
            // the exceptionName is NotAllowedError if the access is rejected by the user. For other names, please check
            // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
            log.warn("Got permission error from the browser: " + e.name + ": " + e.message);
            String msg = "Unknown error accessing the camera";
            if ("AbortError".equals(e.name)) {
                msg = "Unspecified error preventing the use of the camera";
            } else if ("NotAllowedError".equals(e.name)) {
                msg = "Browser denies access to the camera. Please allow access to the camera in your browser and/or use secure connection";
            } else if ("NotFoundError".equals(e.name) || "OverconstrainedError".equals(e.name)) {
                msg = "No camera found";
            } else if ("NotReadableError".equals(e.name)) {
                msg = "Hardware error";
            }
            if (StringUtils.isNotBlank(e.name)) {
                msg = msg + " (" + e.name + ")";
            }
            MyDialog.showError(msg);
            close();
        };
        setContent(reader);
        reader.addValueChangeListener(e -> System.out.println(e));
        open();
    }
}
```

For proper error handling, see [Mozilla docs on getUserMedia()](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia).

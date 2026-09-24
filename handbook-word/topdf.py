# Opens a .docx in LibreOffice, updates the table of contents and all fields, and exports a PDF.
import sys, time, subprocess, uno
from com.sun.star.beans import PropertyValue
def prop(n, v): p = PropertyValue(); p.Name = n; p.Value = v; return p
src, out = sys.argv[1], sys.argv[2]
proc = subprocess.Popen(['soffice', '--headless', '--invisible', '--norestore', '--accept=socket,host=localhost,port=2002;urp;'])
ctx = None
for _ in range(60):
    try:
        local = uno.getComponentContext()
        resolver = local.ServiceManager.createInstanceWithContext('com.sun.star.bridge.UnoUrlResolver', local)
        ctx = resolver.resolve('uno:socket,host=localhost,port=2002;urp;StarOffice.ComponentContext'); break
    except Exception: time.sleep(1)
desktop = ctx.ServiceManager.createInstanceWithContext('com.sun.star.frame.Desktop', ctx)
doc = desktop.loadComponentFromURL(uno.systemPathToFileUrl(src), '_blank', 0, (prop('Hidden', True),))
for _ in range(2):  # twice, so page numbers settle after the contents page fills in
    idx = doc.getDocumentIndexes()
    for i in range(idx.getCount()): idx.getByIndex(i).update()
    doc.getTextFields().refresh()
doc.storeToURL(uno.systemPathToFileUrl(out), (prop('FilterName', 'writer_pdf_Export'),))
doc.close(True)
try: desktop.terminate()
except Exception: pass
proc.wait(timeout=30)
print('pdf written')

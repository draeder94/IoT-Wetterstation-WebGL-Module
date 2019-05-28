# IoT Wetterstation - WebGL Module

WebGL Modul in BabylonJS für [FullStack IoT Wetterstation](https://github.com/jraddatz/IoT-App-Backend)

## Nutzung in JS:

```javascript
// Visualisierung starten
const visualize = initVisualize(canvas);

// Graph zufügen
visualize.addGraph(name, color, data, maxlength);

// Alle Werte im Graph ersetzen
visualize.updateGraph(name, values);

// Wert am Ende des Graphen anfügen
visualize.addToGraph(name, value);
```

Parameter:
- `canvas`: HTML Canvas Element
- `name`: einzigartier Name des Graphen, als String
- `color`: Farbe des Graphen, Array[4], rgba mit Werten von 0 bis 1
- `data`: Objekt mit Werten `format` und `values`
    - `format`: Wert-Fortmat, z.B. "%" oder "°C"
    - `values`: Array von Wertepaaren; Unixzeit (als Zahl) und Wert (als Zahl)
- `maxlength`: (optional) Maximale Anzahl Werte, wenn Länge von Values größer ist, wird es dadurch ersetzt
- `value`: Ein Wertepaar was am Ende angefügt wird; Unixzeit (als Zahl) und Wert (als Zahl)

Beispiel dazu in `testbed/index.js`

## Visualisiertes Beispiel

https://draeder94.github.io/IoT-Wetterstation-WebGL-Module/testbed/
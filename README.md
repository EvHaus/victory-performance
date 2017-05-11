# Victory Performance

A simple example illustrating the poor performance of Victory JS charts

To run:

```
yarn
yarn start
```

There are two sliders under the charts. One changes the pan of the domain (while only rendering 10 bars per row), the other zooms the range in to reveal more chart bars.

Both of those actions are incredibly slow.

## Results

- **Panning with d3**: 13ms to 18ms per frame
- **Panning with victory**: 24ms to 74ms per frame

- **Rendering at full zoom with d3**: 1.30s
- **Rendering at full zoom with victory**: 10s


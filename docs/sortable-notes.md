we should implement both, together, otherwise there will be too many edge cases to test. We could also do a simplementation, where we place
beacon a line between all pairs of insertable positions, while keeping original src element in list. So the ux will be orginal src in list
displayed as empty element (perhaps with accented dashed border) and a ghost element moving with mouse (while keeping the relative position to
mouse, when drag started) and on drop smoothly expand the dest gap, and collapsing the src element int the list. thoughts.

---

wait, did you understand that, there is no layout shift until ghost is released, only nearest beacon, which is a thin line where inserts are possible, one that is nearest to chost gets hilighted. This is the primiary difference that I was suggesting
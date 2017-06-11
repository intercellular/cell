# Genesis

## 1. God

1. In the beginning God creates a [Membrane](#2-membrane). Now the cell has a "shell" (an empty html node) that can be filled.
2. And God builds a [Genotype](#3-genotype). Genotype stores all the data a cell needs to construct itself.
3. And God builds a [Nucleus](#5-nucleus). Nucleus is the central processing unit of a cell. It handles the cell cycle, synchronization, app execution, and other core functions.
4. And God builds a [Phenotype](#6-phenotype). Phenotype is the actual manifestation of the cell's genotype as an HTML element.
5. Finally God's job has finished. From here on, God doesn't get in the way and let each cell take care of its own destiny. Each cell starts its own life cycle based on their membrane, genotype, nucleus, and phenotype.

<br>

## 2. Membrane

Membrane is the "shell" of a cell. The membrane unit determines whether the cell will be created from scratch or if it will be injected into an existing element on the DOM.

- `inject()` - Injects a cell into an existing element. You can inject cells into `head`, `body`, or any element with an `id`.
- `create()` - Creates membrane from scratch and appends it to body. In most cases you will just create everything from scratch instead of injecting into an existing DOM. 
- `build()` - A wrapper around inject() and create(). Depending on the gene info, it decides whether to inject or create. (Inject in case the `$type` is either `body` or `head`, or if there exists an element on the DOM tree that matches one of the gene ids. Otherwise create and append to body). 
<br>

## 3. Genotype

Genotype stores an entire blueprint of a cell. Then, it's used to generate the phenotype (an actual HTML element)

- `set` - stores a single key/value pair under genotype
- `update` - updates genotype for a single key
- `build` - builds an entire genotype for a node

<br>

## 4. Gene

Gene is a utility unit that deals with comparing and deduplicating gene data

- `freeze` - freezes a gene for comparison
- `LCS` - longest common subsequence algorithm
- `diff` - compares two genotypes and comes up with a diff

<br>

## 5. Nucleus

Nucleus handles the actual cell cycle. Nucleus functions as the interface between the outside world/the programmer and the cell's Genotype and Phenotype.

- `tick()` - A polyfill method for `requestAnimationFrame`, which is used throughout the cell cycle. Makes sure all the view updates are carried out in a single animation frame.
- `set()` - Instead of directly setting attributes on an element, we use the nucleus structure as a pseudo proxy. This function makes sure that all the attributes defined on the genotype object gets monitored for change, so we can trigger `$update()` whenever there's an update
- `build()` - The root method for building out the nucleus of an element.
- `bind()` - binds the functions so we can run post-processing logic after each function is run, as well as trigger `$update()` when there's an update.
- `queue()` - queues up all the attributes that may have been udpated, so we can check later and make an update all at once when the call stack becomes empty.

<br>

## 6. Phenotype

A cell's Genotype manifests itself into Phenotype--an actual HTML element.

- `build()` - builds phenotype for a node from genotype. Internally, callse the `update()` for each gene
- `update()` - updates phenotype for a single gene
- `$type()` - updates the `$type` of a phenotype
- `$components()` - updates the `$components` of a phenotype
- `$init()` - automatically called after `Phenotype.build()`
- `$update()` - automatically called when there's a data update on this cell.

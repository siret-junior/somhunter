
#ifndef embedsom_h
#define embedsom_h

#include <random>
#include <vector>

void
som(size_t n,
    size_t k,
    size_t dim,
    size_t rlen,
    const std::vector<float> &points,
    std::vector<float> &koho,
    const std::vector<float> &nhbrdist,
    float alphasA[2],
    float radiiA[2],
    float alphasB[2],
    float radiiB[2],
    const std::vector<float> &scores,
    std::mt19937 &rng);

void
mapPointsToKohos(size_t n,
                 size_t k,
                 size_t dim,
                 const std::vector<float> &points,
                 const std::vector<float> &koho,
                 std::vector<size_t> &mapping);
#endif

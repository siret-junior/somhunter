import numpy as np

a = np.load("w2vv-img_weight-2048x4096floats.npy")
a = a.flatten('C')

with open("w2vv-img_weight-2048x4096floats.bin", "wb") as f:
            f.write(a.tobytes("C"))


b = np.load("w2vv-img_bias-2048floats.npy")

with open("w2vv-img_bias-2048floats.bin", "wb") as f:
            f.write(b.tobytes("C"))
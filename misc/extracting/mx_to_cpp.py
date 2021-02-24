import mxnet as mx
from collections import namedtuple
import numpy as np

batch_def = namedtuple('Batch', ['data'])
sym, arg_params, aux_params = mx.model.load_checkpoint("resnet/resnet-152", 0)

network = mx.mod.Module(symbol=sym.get_internals()['flatten0_output'],
                        label_names=None,
                        context=mx.cpu())
network.bind(for_training=False,
             data_shapes=[("data", (1, 3, 50, 50))])
network.set_params(arg_params, aux_params)

x = np.ones((1, 3, 50, 50), np.float32)
inputs = batch_def([mx.nd.array(x)])

network.forward(inputs)
print(network.get_outputs()[0].asnumpy())

# EXECUTE
# python3 -m mmdnn.conversion._script.convertToIR -f mxnet -n resnet/resnet-152-symbol.json -w resnet/resnet-152-0000.params -d resnet152 --inputShape 3,50,50
# python3 -m mmdnn.conversion._script.IRToCode -f pytorch --IRModelPath resnet152.pb --dstModelPath resnet152.py --IRWeightPath resnet152.npy -dw resnet152.npy
# python3 -m mmdnn.conversion.examples.pytorch.imagenet_test --dump resnet152Full.pth -n resnet152.py -w resnet152.npy
# in resnet152.py in forward set return to flatten0

import torch
import importlib.machinery

loader = importlib.machinery.SourceFileLoader('MainModel', "resnet152.py")

MainModel = loader.load_module()

model = torch.load("resnet152Full.pth")
model.eval()

out = model(torch.tensor(x))
print(out)

traced_script_module = torch.jit.trace(model, torch.tensor(x))
traced_script_module.save("traced_Resnet152.pt")

# RESNEXT


batch_def = namedtuple('Batch', ['data'])
sym, arg_params, aux_params = mx.model.load_checkpoint("resnet/resnext-101-1", 40)

network = mx.mod.Module(symbol=sym.get_internals()['flatten0_output'],
                        label_names=None,
                        context=mx.cpu())
network.bind(for_training=False,
             data_shapes=[("data", (1, 3, 50, 50))])
network.set_params(arg_params, aux_params)

x = np.ones((1, 3, 50, 50), np.float32)
inputs = batch_def([mx.nd.array(x)])

network.forward(inputs)
print(network.get_outputs()[0].asnumpy())

# EXECUTE
# python3 -m mmdnn.conversion._script.convertToIR -f mxnet -n resnet/resnext-101-1-symbol.json -w resnet/resnext-101-1-0040.params -d resnext101 --inputShape 3,50,50
# python3 -m mmdnn.conversion._script.IRToCode -f pytorch --IRModelPath resnext101.pb --dstModelPath resnext101.py --IRWeightPath resnext101.npy -dw resnext101.npy
# python3 -m mmdnn.conversion.examples.pytorch.imagenet_test --dump resnext101Full.pth -n resnext101.py -w resnext101.npy
# in resnext101.py in forward set return to flatten0

loader = importlib.machinery.SourceFileLoader('MainModel', "resnext101.py")

MainModel = loader.load_module()

model = torch.load("resnext101Full.pth")
model.eval()

out = model(torch.tensor(x))
print(out)

traced_script_module = torch.jit.trace(model, torch.tensor(x))
traced_script_module.save("traced_Resnext101.pt")
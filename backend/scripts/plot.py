from matplotlib import pyplot as plt
import re

with open("urine-telemetry.log","r") as f:
    data = str(f.read())

def blockize(values, timestamps):
    new_values = []
    new_timestamps = []
    for value, timestamp in zip(values, timestamps):
        new_values.extend((value, value))
        new_timestamps.extend((timestamp, timestamp))
    return new_values[:-1], new_timestamps[1:]

lines = data.split("\n")
tank_changes = [line[60:] for line in lines if "CHANGE Tank Level" in line]
processor_changes = [line[65:] for line in lines if "CHANGE Processor State" in line]

pattern = re.compile(".+ -> (\d+) \[nasa_ts=(\d+\.\d+), status=24\]")

tank_data = [re.match(pattern, tank_change).groups() for tank_change in tank_changes]
processor_data = [re.match(pattern, processor_change).groups() for processor_change in processor_changes]

tank_values, tank_timestamps = zip(*tank_data)
processor_values, processor_timestamps = zip(*processor_data)

tank_values = list(map(int, tank_values))
tank_timestamps = list(map(float, tank_timestamps))
processor_values = list(map(int, processor_values))
processor_timestamps = list(map(float, processor_timestamps))

tank_values, tank_timestamps = blockize(tank_values, tank_timestamps)
processor_values, processor_timestamps = blockize(processor_values, processor_timestamps)



plt.plot(tank_timestamps, tank_values)
plt.show()

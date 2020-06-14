
#ifndef asyncsom_h
#define asyncsom_h

#include <atomic>
#include <condition_variable>
#include <thread>
#include <vector>

#include "Features.h"
#include "Frames.h"
#include "Scores.h"

class AsyncSom
{
	std::thread worker;

	size_t features_dim;

	// worker sync
	std::condition_variable new_data_wakeup;
	std::mutex worker_lock;

	/*
	 * Worker input protocol:
	 *
	 * new_data is set when a new computation is required after
	 * wakeup to process a new dataset. Worker "eats" this flag together
	 * with input data.
	 *
	 * terminate is set when the worker should exit.
	 */
	bool new_data, terminate;
	std::vector<float> points, scores;

	/*
	 * Worker output protocol:
	 *
	 * m_ready is set when mapping is filled in AND the
	 * memory is fenced correctly.
	 */
	bool m_ready;
	std::vector<std::vector<ImageId>> mapping;

	static void async_som_worker(AsyncSom *parent, const Config &cfg);

public:
	AsyncSom(const Config &cfg);
	~AsyncSom();

	void start_work(const ImageFeatures &fs, const ScoreModel &sc);

	bool map_ready() const
	{
		bool t = m_ready;
		std::atomic_thread_fence(std::memory_order_acquire);
		return t;
	}
	const std::vector<ImageId> &map(size_t i) const
	{
		return mapping.at(i);
	}
};

#endif

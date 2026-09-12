# Data Splitting Strategy

Proper data splitting is critical in time-series and biometric data to ensure a realistic evaluation of the model's generalization capabilities and to prevent data leakage.

## The Danger of Random Window Splitting

When dealing with continuous time-series data like EMG recordings, splitting data randomly *after* windowing is highly problematic.

If you extract sliding windows from a continuous recording and then randomly assign those windows to the train, validation, and test sets, windows that are adjacent in time will likely end up in different sets. Because adjacent windows are highly correlated (they overlap and share underlying physiological state), the model can "memorize" the specific recording session or background noise rather than learning the generalized features of the target vocabulary.

This leads to artificially inflated validation and test accuracies that will not translate to real-world performance on new data.

## Session-Aware Splitting

To prevent leakage, we use **Session-Aware Splitting** (also known as Group K-Fold or block splitting).

The fundamental rule is: **All data from a single continuous recording (session or sentence utterance) must belong entirely to exactly ONE split (train, validation, or test).**

### How Recordings are Grouped
In the Zenodo dataset, each sample is identified by a unique prefix `{i}` representing a specific recorded utterance/sentence. We treat each `{i}` as a distinct "session" or "group".

When splitting the data, we split based on these session IDs, not individual windows.

### Proportions
A typical split might be:
*   **Training Set:** 70% of sessions
*   **Validation Set:** 15% of sessions
*   **Test Set:** 15% of sessions

### Verification
To verify that no leakage has occurred, the data loading pipeline asserts that the intersection of session IDs in the train, validation, and test sets is strictly empty.

```python
assert len(set(train_sessions).intersection(set(val_sessions))) == 0
assert len(set(train_sessions).intersection(set(test_sessions))) == 0
```
This ensures the model is evaluated on entirely unseen utterances, providing a valid estimate of its ability to generalize.

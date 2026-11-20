import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { InspectorPanel } from './InspectorPanel';
import { useAppStore } from '../store/appStore';

function setupDataBindingQuestStep() {
  useAppStore.getState().resetToDefault();
  useAppStore.getState().startQuest('quest-5');
  useAppStore.getState().advanceQuestStep(); // Move from step 1 to step 2 (property step)
  useAppStore.getState().selectEntity('customer');
}

describe('InspectorPanel quest progression', () => {
  beforeEach(() => {
    useAppStore.getState().resetToDefault();
    vi.restoreAllMocks();
    HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it('advances the property quest step when clicking the property row', () => {
    setupDataBindingQuestStep();

    render(<InspectorPanel />);

    expect(useAppStore.getState().currentStepIndex).toBe(1);
    expect(screen.getByRole('heading', { name: 'Customer（客户）' })).toBeTruthy();

    const propertiesHeader = screen.getByText(/属性（\d+）/);
    const propertiesSection = propertiesHeader.closest('.inspector-section');
    expect(propertiesSection).toBeTruthy();

    const propertyInList = within(propertiesSection as HTMLElement).getByText('name（名称）');
    fireEvent.click(propertyInList);

    expect(useAppStore.getState().currentStepIndex).toBe(2);
  });

  it('renders a translated relationship and its attributes', () => {
    useAppStore.getState().selectRelationship('order_contains_product');

    render(<InspectorPanel />);

    expect(screen.getByRole('heading', { name: 'contains（包含）' })).toBeTruthy();
    expect(screen.getByText('quantity（数量）')).toBeTruthy();
    expect(screen.getByText('customizations（定制选项）')).toBeTruthy();
  });

  it('advances the property quest step when clicking the data binding mapping row', () => {
    setupDataBindingQuestStep();

    render(<InspectorPanel />);

    expect(useAppStore.getState().currentStepIndex).toBe(1);

    const bindingsHeader = screen.getByText('数据绑定');
    const bindingsSection = bindingsHeader.closest('.inspector-section');
    expect(bindingsSection).toBeTruthy();

    const mappedColumn = within(bindingsSection as HTMLElement).getByText('full_name');
    fireEvent.click(mappedColumn);

    expect(useAppStore.getState().currentStepIndex).toBe(2);
  });
});

import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, inject, TestBed, } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { BrowserModule, By } from '@angular/platform-browser';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  DynamicFormArrayModel,
  DynamicFormControlEvent,
  DynamicFormControlModel,
  DynamicInputModel
} from '@ng-dynamic-forms/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { of as observableOf } from 'rxjs';
import { FormComponent } from './form.component';
import { FormService } from './form.service';
import { FormBuilderService } from './builder/form-builder.service';
import { FormAddError, FormChangeAction } from './form.actions';
import { FormFieldMetadataValueObject } from './builder/models/form-field-metadata-value.model';
import { GLOBAL_CONFIG } from '../../../config';
import { createTestComponent } from '../testing/utils';
import { getMockFormService } from '../mocks/mock-form-service';
import { getMockFormBuilderService } from '../mocks/mock-form-builder-service';

export const TEST_FORM_MODEL = [
  new DynamicInputModel(
    {
      id: 'dc_title',
      label: 'Title',
      placeholder: 'Title',
      validators: {
        required: null
      },
      errorMessages: {
        required: 'You must enter a main title for this item.'
      }
    }
  ),

  new DynamicInputModel(
    {
      id: 'dc_title_alternative',
      label: 'Other Titles',
      placeholder: 'Other Titles',
    }
  ),

  new DynamicInputModel(
    {
      id: 'dc_publisher',
      label: 'Publisher',
      placeholder: 'Publisher',
    }
  ),

  new DynamicInputModel(
    {
      id: 'dc_identifier_citation',
      label: 'Citation',
      placeholder: 'Citation',
    }
  ),

  new DynamicInputModel(
    {
      id: 'dc_identifier_issn',
      label: 'Identifiers',
      placeholder: 'Identifiers',
    }
  ),
];

export const TEST_FORM_MODEL_WITH_ARRAY = [
  new DynamicFormArrayModel({

    id: 'bootstrapFormArray',
    initialCount: 1,
    label: 'Form Array',
    groupFactory: () => {
      return [
        new DynamicInputModel({

          id: 'bootstrapArrayGroupInput',
          placeholder: 'example array group input',
          readOnly: false
        })
      ];
    }
  })
];

describe('FormComponent test suite', () => {
  let testComp: TestComponent;
  let formComp: FormComponent;
  let testFixture: ComponentFixture<TestComponent>;
  let formFixture: ComponentFixture<FormComponent>;
  let dynamicForm;

  const config = {
    form: {
      validatorMap: {
        required: 'required',
        regex: 'pattern'
      }
    }
  } as any;

  let html;
  let formService;
  let formBuilderService;
  // async beforeEach
  beforeEach(async(() => {

    TestBed.configureTestingModule({
      imports: [
        BrowserModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgbModule.forRoot(),
        TranslateModule.forRoot()
      ],
      declarations: [
        FormComponent,
        TestComponent,
      ], // declare the test component
      providers: [
        ChangeDetectorRef,
        FormComponent,
        { provide: FormBuilderService, useValue: getMockFormBuilderService() },
        { provide: FormService, useValue: getMockFormService() },
        { provide: GLOBAL_CONFIG, useValue: config }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    });
    formService = TestBed.get(FormService);
    formBuilderService = TestBed.get(FormBuilderService);
  }));

  describe('', () => {
  //   // synchronous beforeEach
    beforeEach(() => {
      html = `
        <ds-form *ngIf="formModel" #formRef="formComponent"
                 [formId]="formId"
                 [formModel]="formModel"
                 [displaySubmit]="displaySubmit"></ds-form>`;

      testFixture = createTestComponent(html, TestComponent) as ComponentFixture<TestComponent>;
      testComp = testFixture.componentInstance;
    });

    it('should create FormComponent', inject([FormComponent], (app: FormComponent) => {
      expect(app).toBeDefined();
    }));
  });

  describe('', () => {
    beforeEach(() => {

      formFixture = TestBed.createComponent(FormComponent);
      formComp = formFixture.componentInstance; // FormComponent test instance
      formComp.formId = 'testForm';
      formComp.formModel = TEST_FORM_MODEL;
      formComp.displaySubmit = false;
      formFixture.detectChanges();
      dynamicForm = formFixture.debugElement.query(By.css('ds-dynamic-form'));
      formBuilderService.findById.and.returnValue(TEST_FORM_MODEL);
    });

    afterEach(() => {
      formFixture.destroy();
      formComp = null;
    });
  //
  //   it('should dispatch a FormStatusChangeAction when Form group status changes', () => {
  //     // spyOn(formComp, 'onChange');
  //     const control = new FormControl('', Validators.required);
  //     const event = {
  //       $event: new FormFieldMetadataValueObject('Test Title'),
  //       context: null,
  //       control: control,
  //       group: formComp.formGroup,
  //       model: formComp.formModel[0],
  //       type: 'change'
  //     } as DynamicFormControlEvent;
  //     dynamicForm.componentInstance.change.emit(event);
  //
  //     // expect(formComp.onChange).toHaveBeenCalledWith('testForm', formComp.formGroup.valid);
  //     formComp.onChange(event);
  //     // const control = new FormControl('', Validators.required);
  //     formComp.formGroup.addControl('dc_title', control);
  //     control.setValue('Test Title');
  //
  //     expect(formService.changeForm).toHaveBeenCalledWith('testForm', formComp.formGroup.valid);
  //   });
  //
  //   it('should display form errors when errors are added to the state', () => {
  //
  //     const error = {formComp.formId, 'dc_title', 0, 'error.validation.required';
  //     formService.getFormErrors().next([error]);
  //     formFixture.detectChanges();
  //
  //     expect((formComp as any).formErrors).toEqual([error]);
  //
  //   });
  //
  //   fit('should remove form errors when errors are empty in the state', () => {
  //     (formComp as any).formErrors = [{
  //       fieldId: 'dc_title',
  //       message: 'error.validation.required'
  //     }];
  //     const errors = [];
  //
  //     formService.getFormErrors().next([]);
  //     formFixture.detectChanges();
  //
  //     expect((formComp as any).formErrors).toEqual(errors);
  //
  //   });
  //
    // it('should dispatch FormChangeAction on form change', inject([FormBuilderService], (service: FormBuilderService) => {
    //   const event = {
    //     $event: new FormFieldMetadataValueObject('Test Title'),
    //     context: null,
    //     control: formComp.formGroup.get('dc_title'),
    //     group: formComp.formGroup,
    //     model: formComp.formModel[0],
    //     type: 'change'
    //   } as DynamicFormControlEvent;
    //
    //   spyOn(formComp.change, 'emit');
    //
    //   formComp.onChange(event);
    //
    //   expect(store.dispatch).toHaveBeenCalledWith(new FormChangeAction('testForm', service.getValueFromModel(formComp.formModel)));
    //   expect(formComp.change.emit).toHaveBeenCalled();
    // }));
    //
    // it('should emit change on form change', inject([FormBuilderService], (service: FormBuilderService) => {
    //   const event = {
    //     $event: new FormFieldMetadataValueObject('Test Title'),
    //     context: null,
    //     control: formComp.formGroup.get('dc_title'),
    //     group: formComp.formGroup,
    //     model: formComp.formModel[0],
    //     type: 'change'
    //   } as DynamicFormControlEvent;
    //
    //   spyOn(formComp.change, 'emit');
    //
    //   formComp.onChange(event);
    //
    //   expect(formComp.change.emit).toHaveBeenCalled();
    // }));
    //
    // it('should not emit change Event on form change when emitChange is false', inject([FormBuilderService], (service: FormBuilderService) => {
    //   const event = {
    //     $event: new FormFieldMetadataValueObject('Test Title'),
    //     context: null,
    //     control: formComp.formGroup.get('dc_title'),
    //     group: formComp.formGroup,
    //     model: formComp.formModel[0],
    //     type: 'change'
    //   } as DynamicFormControlEvent;
    //
    //   formComp.emitChange = false;
    //   spyOn(formComp.change, 'emit');
    //
    //   formComp.onChange(event);
    //
    //   expect(formComp.change.emit).not.toHaveBeenCalled();
    // }));
    //
    // it('should emit blur Event on blur', () => {
    //   const event = {
    //     $event: new FocusEvent('blur'),
    //     context: null,
    //     control: formComp.formGroup.get('dc_title'),
    //     group: formComp.formGroup,
    //     model: formComp.formModel[0],
    //     type: 'blur'
    //   } as DynamicFormControlEvent;
    //
    //   spyOn(formComp.blur, 'emit');
    //
    //   formComp.onBlur(event);
    //
    //   expect(formComp.blur.emit).toHaveBeenCalled();
    // });
    //
    // it('should emit focus Event on focus', () => {
    //   const event = {
    //     $event: new FocusEvent('focus'),
    //     context: null,
    //     control: formComp.formGroup.get('dc_title'),
    //     group: formComp.formGroup,
    //     model: formComp.formModel[0],
    //     type: 'focus'
    //   } as DynamicFormControlEvent;
    //
    //   spyOn(formComp.focus, 'emit');
    //
    //   formComp.onFocus(event);
    //
    //   expect(formComp.focus.emit).toHaveBeenCalled();
    // });
    //
    // it('should return Observable of form status', () => {
    //
    //   const control = formComp.formGroup.get(['dc_title']);
    //   control.setValue('Test Title');
    //   formState.testForm.valid = true;
    //   store.nextState(formState);
    //   formFixture.detectChanges();
    //
    //   formComp.isValid().subscribe((valid) => {
    //     expect(valid).toBe(true);
    //   });
    // });
    //
    // it('should emit submit Event on form submit whether the form is valid', () => {
    //
    //   const control = formComp.formGroup.get(['dc_title']);
    //   control.setValue('Test Title');
    //   formState.testForm.valid = true;
    //   spyOn(formComp.submit, 'emit');
    //
    //   store.nextState(formState);
    //   formFixture.detectChanges();
    //
    //   formComp.onSubmit();
    //   expect(formComp.submit.emit).toHaveBeenCalled();
    // });
    //
    // it('should not emit submit Event on form submit whether the form is not valid', () => {
    //
    //   spyOn((formComp as any).formService, 'validateAllFormFields');
    //
    //   store.nextState(formState);
    //   formFixture.detectChanges();
    //
    //   formComp.onSubmit();
    //   expect((formComp as any).formService.validateAllFormFields).toHaveBeenCalled();
    // });
    //
    // it('should reset form group', () => {
    //
    //   spyOn(formComp.formGroup, 'reset');
    //
    //   formComp.reset();
    //
    //   expect(formComp.formGroup.reset).toHaveBeenCalled();
    // });
  // });
  //
  // describe('', () => {
  //   beforeEach(() => {
  //
  //     formFixture = TestBed.createComponent(FormComponent);
  //     formComp = formFixture.componentInstance; // FormComponent test instance
  //     formComp.formId = 'testFormArray';
  //     formComp.formModel = TEST_FORM_MODEL_WITH_ARRAY;
  //     formComp.displaySubmit = false;
  //     formFixture.detectChanges();
  //     spyOn(store, 'dispatch');
  //   });
  //
  //   afterEach(() => {
  //     formFixture.destroy();
  //     formComp = null;
  //   });
  //
  //   it('should return ReadOnly property from array item', inject([FormBuilderService], (service: FormBuilderService) => {
  //     const readOnly = formComp.isItemReadOnly(formComp.formModel[0] as DynamicFormArrayModel, 0);
  //
  //     expect(readOnly).toBe(false);
  //   }));
  //
  //   it('should dispatch FormChangeAction when an item has been added to an array', inject([FormBuilderService], (service: FormBuilderService) => {
  //     formComp.insertItem(new Event('click'), formComp.formModel[0] as DynamicFormArrayModel, 1);
  //
  //     expect(store.dispatch).toHaveBeenCalledWith(new FormChangeAction('testFormArray', service.getValueFromModel(formComp.formModel)));
  //   }));
  //
  //   it('should emit addArrayItem Event when an item has been added to an array', inject([FormBuilderService], (service: FormBuilderService) => {
  //     spyOn(formComp.addArrayItem, 'emit');
  //
  //     formComp.insertItem(new Event('click'), formComp.formModel[0] as DynamicFormArrayModel, 1);
  //
  //     expect(formComp.addArrayItem.emit).toHaveBeenCalled();
  //   }));
  //
  //   it('should dispatch FormChangeAction when an item has been removed from an array', inject([FormBuilderService], (service: FormBuilderService) => {
  //     formComp.removeItem(new Event('click'), formComp.formModel[0] as DynamicFormArrayModel, 1);
  //
  //     expect(store.dispatch).toHaveBeenCalledWith(new FormChangeAction('testFormArray', service.getValueFromModel(formComp.formModel)));
  //   }));
  //
  //   it('should emit removeArrayItem Event when an item has been removed from an array', inject([FormBuilderService], (service: FormBuilderService) => {
  //     spyOn(formComp.removeArrayItem, 'emit');
  //
  //     formComp.removeItem(new Event('click'), formComp.formModel[0] as DynamicFormArrayModel, 1);
  //
  //     expect(formComp.removeArrayItem.emit).toHaveBeenCalled();
  //   }));
  })
});

// declare a test component
@Component({
  selector: 'ds-test-cmp',
  template: ``
})
class TestComponent {

  public formId;
  public formModel: DynamicFormControlModel[];
  public displaySubmit = false;

  constructor() {
    this.formId = 'testForm';
    this.formModel = TEST_FORM_MODEL;
  }

}
